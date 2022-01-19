import { nanoid } from "nanoid";
import { EffectCallback, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { 
    FlowBatch, 
    FlowContent, 
    FlowOperation, 
    FlowPresence, 
    FlowSelection, 
    FlowSyncInput, 
    FlowSyncOutput, 
    FlowSyncProtocol, 
    HttpFlowSyncProtocol,
} from "scribing";
import { DeferrableEvent } from ".";
import { FlowEditorState } from "./FlowEditorState";
import { StateChangeEvent } from "./StateChangeEvent";
import { InitEditorEvent } from "./InitEditorEvent";
import { getLocalStorage, setLocalStorage } from "./internal/utils/localstorage";

/** @public */
export interface FlowEditorClient {
    readonly state: FlowEditorState | null;
    readonly connection: ConnectionStatus;
    readonly autoSync: boolean;
    readonly frozen: boolean | null;
    apply(event: StateChangeEvent): boolean;
    disconnect(): void;
    reconnect(): void;
    sync(): void;
    freeze(value?: boolean): void;
    clean(): Promise<FlowEditorState>;
}

/** @public */
export type ConnectionStatus = (
    "disconnected" |
    "connecting" |
    "clean" |
    "dirty" |
    "syncing" |
    "broken"
);

/** @public */
export interface FlowEditorClientOptions {
    autoSync?: boolean;
    clientKey?: string;
    onSyncing?: (event: DeferrableEvent) => void;
    onInit?: (event: InitEditorEvent) => void;
}

/** @public */
export function useFlowEditorClient(
    url: string | null,
    options?: FlowEditorClientOptions
): FlowEditorClient;
/** @public */
export function useFlowEditorClient(
    protocol: FlowSyncProtocol | null,
    options?: FlowEditorClientOptions
): FlowEditorClient;
export function useFlowEditorClient(
    urlOrProtocol: FlowSyncProtocol | string | null, 
    options: FlowEditorClientOptions = {}
): FlowEditorClient {
    const { autoSync = true, clientKey: givenClientKey, onSyncing, onInit } = options;
    const [state, setState] = useState<FlowEditorState | null>(null);
    const [frozen, setFrozen] = useState<boolean | null>(null);
    const [connection, setConnection] = useState<ConnectionStatus>(urlOrProtocol ? "connecting" : "disconnected");
    const useConnectionEffect = (when: ConnectionStatus, effect: EffectCallback) => useEffect(() => {
        if (connection === when) {
            return effect();
        }
    }, [connection, protocol]);
    const [syncedSelection, setSyncedSelection] = useState<FlowSelection | null>(null);
    const local = useRef<FlowEditorState | null>(null);
    const syncVersion = useRef(0);
    const lastSync = useRef(0);
    const lastRemoteChange = useRef(0);
    const pendingChange = useRef<PendingChange | null>(null);
    const pendingSelection = useRef<FlowSelection | null>(null);
    const pendingFrozen = useRef<boolean | undefined>();
    const [waiting, setWaiting] = useState<WaitingArray>([]);

    const disconnect = useCallback(() => setConnection("disconnected"), []);
    const reconnect = useCallback(() => setConnection("connecting"), []);
    const sync = useCallback(() => setConnection("syncing"), []);
    const freeze = useCallback((value = true) => {
        pendingFrozen.current = value;
        sync();
    }, [sync]);
    const clean = useCallback(() => new Promise<FlowEditorState>((resolve, reject) => {
        setWaiting(before => [...before, { resolve, reject }]);
        sync();
    }), [sync]);

    // Setup effective client key
    const effectiveClientKey = useMemo(
        () => typeof givenClientKey === "string" ? givenClientKey : getStaticClientKey(), 
        [givenClientKey]
    );

    // Apply local change
    const apply = useCallback((event: StateChangeEvent): boolean => {
        // We must have a local state, otherwise we're not connected, and it
        // must match the specified before state, otherwise we're out of sync.
        if (!local.current?.equals(event.before)) {
            return false;
        }

        // Do not allow changes to be made when editor is frozen
        if (frozen && event.change !== null) {
            return false;
        }

        // Always set pending selection
        pendingSelection.current = event.after.selection;

        // Merge pending operation if needed
        if (event.change !== null) {
            if (pendingChange.current === null) {
                pendingChange.current = {
                    operation: event.change,
                    baseContent: event.before.content,
                };
            } else {
                const merged = FlowBatch.fromArray([
                    pendingChange.current.operation,
                    event.change,
                ]);
                if (merged === null) {
                    pendingChange.current = null;
                } else {
                    pendingChange.current.operation = merged;
                }
            }

            // Mark connection as dirty if currently clean
            if (pendingChange.current !== null) {
                setConnection(before => before === "clean" ? "dirty" : before);
            }
        }

        // Save formatting marks setting whenever it changes
        if (event.after.formattingMarks !== event.before.formattingMarks) {
            setFormattingMarksSetting(event.after.formattingMarks);
        }

        // Store new local state
        setState(local.current = event.after);
        return true;
    }, [frozen]);

    // Derive protocol from url
    const protocol = useMemo(() => {
        if (typeof urlOrProtocol === "string") {
            return new HttpFlowSyncProtocol(urlOrProtocol);
        } else {
            return urlOrProtocol;
        }
    }, [urlOrProtocol]);

    // Reconnect when protocol changes
    useEffect(() => setConnection(protocol ? "connecting" : "disconnected"), [protocol]);

    // Fetch snapshot when connecting
    useConnectionEffect("connecting", () => {
        if (!protocol) {
            setConnection("disconnected");
            return;
        }
        let active = true;
        setState(local.current = null);
        setFrozen(null);
        (async function connecting() {
            try {
                let snapshot = await protocol.read();

                if (snapshot === null) {
                    const initEvent = new InitEditorEvent();
                    if (onInit) {
                        onInit(initEvent);
                        await initEvent._complete();
                    }
                    const { content, language, skip } = initEvent;
                    if (!skip) {
                        snapshot = await protocol.init(content, language);
                        if (snapshot === null) {
                            // In the unlikely case that someone else initialized it before we did
                            snapshot = await protocol.read();
                        }
                    }
                }

                if (active) {
                    if (snapshot === null) {
                        console.error("Flow editor connection is broken. Server resource not found.");
                        setConnection("broken");
                    } else {
                        setConnection("clean");
                        setSyncedSelection(null);
                        syncVersion.current = snapshot.version;
                        pendingChange.current = null;
                        pendingSelection.current = null;
                        pendingFrozen.current = undefined;
                        lastSync.current = lastRemoteChange.current = Date.now();
                        setFrozen(snapshot.frozen);
                        setState(local.current = FlowEditorState.empty.merge({
                            content: snapshot.content,
                            theme: snapshot.theme,
                            presence: Object.freeze(snapshot.presence),
                            formattingMarks: getFormattingMarksSetting(),
                        }));
                    }
                }
            } catch (error) {
                if (active) {
                    console.error("Flow editor connection is broken. Failed to read snapshot:", error);
                    setConnection("broken");
                }
            }
        })();
        return () => { active = false; };
    });

    // Handle syncing connection
    useConnectionEffect("syncing", () => {
        if (!protocol) {
            setConnection("disconnected");
            return;
        }
        let active = true;
        (async function syncing() {
            try {
                // Determine what to sync
                const outgoingChange = pendingChange.current;
                pendingChange.current = null;

                const input: FlowSyncInput = {
                    client: effectiveClientKey,
                    version: syncVersion.current,
                    operation: outgoingChange?.operation ?? null,
                    selection: pendingSelection.current,
                    frozen: pendingFrozen.current,
                };

                if (onSyncing) {
                    const event = new DeferrableEvent();
                    onSyncing(event);
                    await event._complete();
                }        

                // Run with retry to support flaky connection
                for (let attempt = 1; attempt <= MAX_SYNC_ATTEMPTS && active; ++attempt) {
                    if (attempt > 1) {
                        const backoff = MIN_BACKOFF_DELAY + Math.random() * RANDOM_BACKOFF_DELAY;
                        await new Promise(resolve => setTimeout(resolve, backoff));
                    }                   
                    
                    let output: FlowSyncOutput | null = null;
                    try {
                        output = await protocol.sync(input);
                    } catch (error) {
                        if (attempt >= MAX_SYNC_ATTEMPTS) {
                            throw error;
                        }
                    }

                    if (output === null) {
                        console.warn(`Flow editor sync attempt ${attempt} of ${MAX_SYNC_ATTEMPTS} failed`);
                        continue;
                    }

                    if (active && local.current !== null) {
                        // Compute merged selection
                        let mergedSelection = local.current.selection;
                        if (output.merge && mergedSelection) {
                            mergedSelection = output.merge.applyToSelection(mergedSelection, false);
                        }

                        // Compute merged content
                        let mergedContent = outgoingChange ? outgoingChange.baseContent : local.current.content;
                        if (output.merge) {
                            mergedContent = output.merge.applyToContent(mergedContent);
                        }

                        // Apply outgoing change
                        if (outgoingChange) {
                            let mergedOperation: FlowOperation | null = outgoingChange.operation;
                            if (output.merge) {
                                mergedOperation = output.merge.transform(mergedOperation);
                            }
                            if (mergedOperation) {
                                mergedContent = mergedOperation.applyToContent(mergedContent);
                            }

                            // Verify content digest
                            const digest = await mergedContent.digest();
                            if (digest !== output.digest) {
                                console.error("Flow editor connection is broken. Content digest mismatch.");
                                setConnection("broken");
                                console.debug(
                                    "Client content:", mergedContent.toJsonValue(),
                                    "\nServer content:", (await protocol.read())?.content.toJsonValue()
                                );
                                return;
                            }
                        }

                        // Apply next pending change
                        if (pendingChange.current) {
                            const pending: PendingChange = pendingChange.current;
                            if (output.merge) {
                                const mergedPending = output.merge.transform(pending.operation);
                                if (mergedPending) {
                                    pending.operation = mergedPending;
                                } else {
                                    pendingChange.current = null;
                                }
                            }
                            if (pendingChange.current) {
                                pending.baseContent = mergedContent;
                                mergedContent = pending.operation.applyToContent(mergedContent);
                            }
                        }

                        // Apply new synced state
                        syncVersion.current = output.version;
                        lastSync.current = Date.now();
                        if (
                            output.merge !== null || 
                            !areEqualPresences(local.current?.presence ?? [], output.presence)
                        ) {
                            lastRemoteChange.current = lastSync.current;
                        }
                        setConnection(pendingChange.current === null ? "clean" : "dirty");
                        setSyncedSelection(mergedSelection);
                        setFrozen(output.frozen);
                        setState(local.current = local.current.merge({
                            content: mergedContent,
                            selection: mergedSelection,
                            presence: Object.freeze(output.presence),
                        }));
                    }

                    return;
                }

                if (active) {
                    console.error("Flow editor connection is broken. Ran out of sync attempts.");
                    setConnection("broken");
                }
            } catch (error) {
                if (active) {
                    console.error("Flow editor connection is broken. Sync error:", error);
                    setConnection("broken");
                }
            }
        })();
        return () => { active = false; };
    });

    // Trigger sync when needed
    useEffect(() => {
        let interval: number | undefined;

        if (autoSync) {
            if (connection === "dirty" || pendingFrozen.current !== void(0)) {
                interval = DIRTY_SYNC_INTERVAL;
            } else if (connection === "clean") {
                if (!areEqualSelections(pendingSelection.current, syncedSelection)) {
                    interval = SELECTION_SYNC_INTERVAL;
                } else {
                    interval = Math.max(
                        MIN_CLEAN_SYNC_INTERVAL,
                        Math.min(
                            MAX_CLEAN_SYNC_INTERVAL,
                            Math.round((Date.now() - lastRemoteChange.current) / 3),
                        ),
                    );
                }
            }
        }

        if (typeof interval !== "number") {
            return;
        }

        const delay = Math.max(
            MIN_SYNC_INTERVAL,
            Math.min(MAX_SYNC_INTERVAL, Date.now() - lastSync.current + interval)
        );
        const timerId = setTimeout(() => setConnection("syncing"), delay);
        return () => clearTimeout(timerId);
    }, [autoSync, connection, pendingSelection.current, syncedSelection, pendingFrozen.current]);

    // Notify waiting promises
    useEffect(() => {
        if (waiting.length > 0 && (connection === "broken" || connection === "clean")) {
            waiting.forEach(({resolve, reject}) => {
                if (connection === "clean" && state) {
                    resolve(state);
                } else {
                    reject(new Error("Failed to await clean editor state"));
                }
            });
            setWaiting([]);
        }
    }, [connection, waiting, state]);

    return { state, connection, frozen, autoSync, apply, disconnect, reconnect, sync, freeze, clean };
}

type WaitingArray = Array<{resolve: (state: FlowEditorState) => void, reject: (error: Error) => void}>;

interface PendingChange {
    operation: FlowOperation;
    baseContent: FlowContent;
}

const areEqualSelections = (x: FlowSelection | null | undefined, y: FlowSelection | null): boolean => {
    if (x === y) {
        return true;
    } else if (x instanceof FlowSelection && y instanceof FlowSelection) {
        return FlowSelection.baseType.equals(x, y);
    } else {
        return false;
    }
};

const areEqualPresences = (x: readonly FlowPresence[], y: readonly FlowPresence[]): boolean => areEqualMaps(
    getMappedPresence(x),
    getMappedPresence(y),
    (a, b) => areEqualMaps(a, b, areEqualSelections),
);

const getMappedPresence = (array: readonly FlowPresence[]): Map<string, Map<string, FlowSelection | null>> => {
    const byUser = new Map<string, Map<string, FlowSelection | null>>();
    for (const item of array) {
        let byClient = byUser.get(item.user);
        if (!byClient) {
            byUser.set(item.user, byClient = new Map());
        }
        byClient.set(item.client, item.selection);
    }
    return byUser;
};

const areEqualMaps = <T>(
    x: ReadonlyMap<string, T>,
    y: ReadonlyMap<string, T>,
    eq: (a: T, b: T) => boolean,
): boolean => {
    for (const key of new Set([...x.keys(), ...y.keys()])) {
        const fromX = x.get(key);
        const fromY = y.get(key);
        if (fromX === fromY) {
            continue;
        }
        if (fromX === void(0) || fromY === void(0) || !eq(fromX, fromY)) {
            return false;
        }        
    }
    return true;
};

const MIN_SYNC_INTERVAL = 500;
const DIRTY_SYNC_INTERVAL = MIN_SYNC_INTERVAL;
const SELECTION_SYNC_INTERVAL = DIRTY_SYNC_INTERVAL;
const MIN_CLEAN_SYNC_INTERVAL = 1000;
const MAX_CLEAN_SYNC_INTERVAL = 4000;
const MAX_SYNC_INTERVAL = 5000;
const MAX_SYNC_ATTEMPTS = 10;
const MIN_BACKOFF_DELAY = 1000;
const RANDOM_BACKOFF_DELAY = 2000;
const CLIENT_KEY_STORAGE_KEY = "Scribing.FlowEditor.ClientKey";
const FORMATTING_MARKS_STORAGE_KEY = "Scribing.FlowEditor.FormattingMarks";

const getStaticClientKey = (): string => {
    let stored = getLocalStorage(CLIENT_KEY_STORAGE_KEY);
    if (typeof stored !== "string") {
        stored = nanoid();
        setLocalStorage(CLIENT_KEY_STORAGE_KEY, stored);
    }
    return stored;
};

const getFormattingMarksSetting = (): boolean => {
    const stored = getLocalStorage(FORMATTING_MARKS_STORAGE_KEY);
    if (stored === "false") {
        return false;
    } else {
        return true;
    }
};

const setFormattingMarksSetting = (value: boolean) => {
    setLocalStorage(FORMATTING_MARKS_STORAGE_KEY, value ? "true" : "false");
};
