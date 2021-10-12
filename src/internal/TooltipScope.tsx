import { VirtualElement } from "@popperjs/core";
import React, { createContext, FC, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { FlowEditorCommands } from "./FlowEditorCommands";
import { useNativeEventHandler } from "./hooks/use-native-event-handler";
import { Tooltip } from "./Tooltip";
import { TooltipData, TooltipManager } from "./TooltipManager";

/** @internal */
export interface TooltipScopeProps {
    manager?: TooltipManager;
    children?: ReactNode;
}

/** @internal */
export const TooltipScope: FC<TooltipScopeProps> = ({children, manager: given}) => {
    const manager = useMemo(() => given ?? new TooltipManager(), [given]);
    const [active, setActive] = useState<TooltipData | null>(manager.current || null);
    const [display, setDisplay] = useState<TooltipData | null>(active);
    
    useNativeEventHandler(window, "keydown", (event: KeyboardEvent) => {
        if (event.key === "Escape" && active !== null) {
            manager.remove(active.key);
        }
    }, [active, manager]);
    
    useEffect(() => manager.sub(setActive), [manager]);

    useEffect(() => {
        if (active && display && active.key === display.key) {
            setDisplay(active);
        } else {
            const timeout = setTimeout(() => setDisplay(active), 250);
            return () => clearTimeout(timeout);
        }
    }, [active, display]);

    return (
        <TooltipContext.Provider value={manager}>
            {children}
            {display && <Tooltip active={display === active} {...display}/>}
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
