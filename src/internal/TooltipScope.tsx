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
}

/** @internal */
export const TooltipScope: FC<TooltipScopeProps> = ({children, manager: given}) => {
    const manager = useMemo(() => given ?? new TooltipManager(), [given]);
    const [current, setCurrent] = useState<TooltipData | null>(manager.current || null);
    const [active, setActive] = useState<TooltipData | null>(current);
    const [displayOne, setDisplayOne] = useState<TooltipData | null>(current);
    const [displayTwo, setDisplayTwo] = useState<TooltipData | null>(null);
    const counter = useRef(0);    
    
    useNativeEventHandler(window, "keydown", (event: KeyboardEvent) => {
        if (event.key === "Escape" && current !== null) {
            manager.remove(current.key);
        }
    }, [current, manager]);
    
    useEffect(() => manager.sub(setCurrent), [manager]);

    useEffect(() => {
        if (current !== null) {
            if (current.key === displayOne?.key) {
                setDisplayOne(current);
            } else if (current.key === displayTwo?.key) {
                setDisplayTwo(current);
            } else {
                [setDisplayOne, setDisplayTwo][counter.current++ % 2](current);
            }
        }
        const timeout = setTimeout(() => setActive(current), 0);
        return () => clearTimeout(timeout); 
    }, [current]);

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
            {displayOne && <Tooltip active={displayOne === active} {...displayOne}/>}
            {displayTwo && <Tooltip active={displayTwo === active} {...displayTwo}/>}
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
