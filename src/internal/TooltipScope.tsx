import { VirtualElement } from "@popperjs/core";
import React, { createContext, FC, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { FlowEditorCommands } from "./FlowEditorCommands";
import { useNativeEventHandler } from "./hooks/use-native-event-handler";
import { Tooltip } from "./Tooltip";
import { TooltipData, TooltipManager } from "./TooltipManager";

/** @internal */
export interface TooltipScopeProps {
    manager?: TooltipManager;
    children?: ReactNode;
    boundary?: HTMLElement | null;
    autoOpenTools?: boolean;
}

/** @internal */
export const TooltipScope: FC<TooltipScopeProps> = ({children, manager: given, boundary, autoOpenTools}) => {
    const manager = useMemo(() => given ?? new TooltipManager(), [given]);
    const [current, setCurrent] = useState<TooltipData | null>(manager.current || null);
    const [active, setActive] = useState<TooltipData | null>(current);
    const [pending, setPending] = useState<TooltipData | null>(null);
    const [displayOne, setDisplayOne] = useState<TooltipData | null>(current);
    const [displayTwo, setDisplayTwo] = useState<TooltipData | null>(null);
    const [deferToken, setDeferToken] = useState(0);
    const [editingHost, setEditingHost] = useState<HTMLElement | null>(manager.editingHost?.current ?? null);
    const counter = useRef(0);    
    const setDisplay = (data: TooltipData) => {
        if (data.key === displayOne?.key) {
            setDisplayOne(data);
        } else if (data.key === displayTwo?.key) {
            setDisplayTwo(data);
        } else {
            [setDisplayOne, setDisplayTwo][counter.current++ % 2](data);
        }
        setTimeout(() => setActive(data), 0);
        setPending(null);
    };

    useEffect(() => manager.editingHost.sub(setEditingHost), [manager, setEditingHost]);
    
    useNativeEventHandler(window, "keydown", (event: KeyboardEvent) => {
        if (event.key === "Escape" && current !== null) {
            setActive(null);
        }

        if (event.key === "." && event.ctrlKey) {
            if (pending !== null) {
                setDisplay(pending);
            } else if (active === null && current?.content instanceof FlowEditorCommands) {
                setDisplay(current);
            }
        } else {
            setDeferToken(before => before + 1);
        }
    }, [current, pending, manager]);

    useNativeEventHandler(window, "mousemove", () => {
        if (pending !== null) {
            setDeferToken(before => before + 1);
        }
    }, [pending]);
    
    useEffect(() => manager.sub(setCurrent), [manager]);

    useEffect(() => {
        if (current === null) {
            setActive(null);
            return;
        }

        if (
            current.content instanceof FlowEditorCommands && 
            current.content.isCaret() &&
            !(
                active?.content instanceof FlowEditorCommands &&
                active.content.isCaret()
            )
        ) {
            setActive(null);
            setPending(current);
        } else if (
            current.content instanceof FlowEditorCommands ||
            !(active?.content instanceof FlowEditorCommands)
        ) {
            setDisplay(current);
        }
    }, [current]);

    useEffect(() => {
        if (pending !== null && autoOpenTools) {
            const timeout = setTimeout(() => setDisplay(pending), 3000);
            return () => clearTimeout(timeout);
        }
    }, [pending, deferToken, autoOpenTools]);

    useEffect(() => {
        if (displayOne && displayOne !== active) {
            const timeout = setTimeout(() => setDisplayOne(null), 250);
            return () => clearTimeout(timeout);
        }
    }, [displayOne, active]);

    useEffect(() => {
        if (displayTwo && displayTwo !== active) {
            const timeout = setTimeout(() => setDisplayTwo(null), 250);
            return () => clearTimeout(timeout);
        }
    }, [displayTwo, active]);

    return (
        <TooltipContext.Provider value={manager}>
            {children}
            {displayOne && (
                <Tooltip
                    {...displayOne}
                    active={displayOne === active}
                    boundary={boundary}
                    editingHost={editingHost}
                />
            )}
            {displayTwo && (
                <Tooltip
                    {...displayTwo}
                    active={displayTwo === active}
                    boundary={boundary}
                    editingHost={editingHost}
                />
            )}
        </TooltipContext.Provider>
    );
};

/** @internal */
export function useShowTip(manager?: TooltipManager): OmitThisParameter<typeof showTip> {
    return useBinding(showTip, manager);
}

/** @internal */
export function useShowTools(manager?: TooltipManager): OmitThisParameter<typeof showTools> {
    return useBinding(showTools, manager);
}

interface TooltipSource {
    manager: TooltipManager | null;
    key: number;
}

// eslint-disable-next-line @typescript-eslint/ban-types
function useBinding<T extends Function>(
    func: T,
    manager: TooltipManager | null = null, 
): OmitThisParameter<T> {
    const managerFromContext = useTooltipManager();    
    const key = useMemo(() => ++sourceKeyCounter, []);
    if (manager === null) {
        manager = managerFromContext;
    }
    const source = useMemo<TooltipSource>(() => ({ manager, key }), [manager, key]);
    return func.bind(source);
}

function showTip(this: TooltipSource, reference: VirtualElement, message: string): () => void {
    return showContent.call(this, reference, message);
}

function showTools(this: TooltipSource, reference: VirtualElement, commands: FlowEditorCommands): () => void {
    return showContent.call(this, reference, commands);
}

function showContent(
    this: TooltipSource,
    reference: VirtualElement,
    content: string | FlowEditorCommands
): () => void {
    const { manager, key } = this;
    let active = true;
    if (manager) {
        manager.addOrUpdate({ key, reference, content });
    }
    return () => {
        if (active) {
            active = false;
            if (manager) {
                manager.remove(key);
            }
        }
    };
}

let sourceKeyCounter = 0;
const useTooltipManager = () => useContext(TooltipContext);
const TooltipContext = createContext<TooltipManager | null>(null);
