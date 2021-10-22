import { useEffect, useState, useMemo } from "react";
import { PubSub } from "../utils/PubSub";

/** @internal */
export const useCtrlKey = (): boolean => useModifierKey("ctrlKey");

/** @internal */
export const useShiftKey = (): boolean => useModifierKey("shiftKey");

/** @internal */
export const useAltKey = (): boolean => useModifierKey("altKey");

type ModifierKey = "ctrlKey" | "shiftKey" | "altKey";

const useModifierKey = (modifier: ModifierKey): boolean => {
    const source = useMemo(() => getKeySource(modifier), [modifier]);
    const [state, setState] = useState(!!source.current);
    useEffect(() => {
        setState(!!source.current);
        return source.sub(setState);
    }, [source, setState]);
    return state;
};

type ModifierKeyEvent<T extends ModifierKey> = Record<T, boolean>;

const keySourceCache = new Map<ModifierKey, ReturnType<typeof makeKeySource>>();

const getKeySource = <T extends ModifierKey>(key: T) => {
    let source = keySourceCache.get(key);
    if (!source) {
        keySourceCache.set(key, source = makeKeySource(key));
    }
    return source;
};

const makeKeySource = <T extends ModifierKey>(key: T) => new (
    class KeySource<T extends ModifierKey> extends PubSub<boolean> {
        readonly #key: T;
        #handler: (e: ModifierKeyEvent<T>) => void;
        #eventSources = new Set<Window>();
        constructor(key: T) { 
            super(false);
            this.#key = key;
            this.#handler = e => this.pub(e[this.#key]);
        }
        onStart() {
            try {
                let w: Window = window;
                while (w) {
                    MODIFIER_KEY_EVENTS.forEach(type => w.addEventListener(type, this.#handler));
                    this.#eventSources.add(w);
                    const { parent } = w;
                    if (parent === null || parent === w) {
                        break;
                    } else {
                        w = parent;
                    }
                }
            } catch {
                // ignored. may throw when access to parent window is denied
            }        
        }
        onStop() {
            for (const w of this.#eventSources) {
                MODIFIER_KEY_EVENTS.forEach(type => w.removeEventListener(type, this.#handler));
            }
            this.#eventSources.clear();
        }
    }
)(key);

const MODIFIER_KEY_EVENTS = [
    "keydown",
    "keyup",
    "mousemove",
] as const;
