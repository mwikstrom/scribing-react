import { VirtualElement } from "@popperjs/core";
import React, { createContext, FC, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { FlowSelection } from "scribing";
import { Tooltip, TooltipProps } from "./Tooltip";
import { TooltipManager } from "./TooltipManager";

/** @internal */
export interface TooltipScopeProps {
    manager?: TooltipManager;
    children?: ReactNode;
}

/** @internal */
export const TooltipScope: FC<TooltipScopeProps> = ({children, manager: given}) => {
    const manager = useMemo(() => given ?? new TooltipManager(), [given]);
    const [active, setActive] = useState<TooltipProps | null>(manager.current || null);
    useEffect(() => manager.sub(setActive), [manager]);
    return (
        <TooltipContext.Provider value={manager}>
            {children}
            {active && <Tooltip {...active}/>}
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
    const { manager, key } = this;
    let active = true;
    if (manager) {
        manager.addOrUpdate(key, reference, message);
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

function showTools(this: TooltipSource, reference: VirtualElement, selection: FlowSelection): () => void {
    const { manager, key } = this;
    let active = true;
    if (manager) {
        manager.addOrUpdate(key, reference, `TOOLS @ ${JSON.stringify(selection.toJsonValue())}`);
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
