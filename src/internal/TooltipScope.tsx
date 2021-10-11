import { VirtualElement } from "@popperjs/core";
import React, { createContext, FC, useContext, useEffect, useMemo, useState } from "react";
import { Tooltip, TooltipProps } from "./Tooltip";
import { PubSub } from "./utils/PubSub";

/** @internal */
export const TooltipScope: FC = ({children}) => {
    const manager = useMemo(() => new TooltipManager(), []);
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
export function useShowTip(): OmitThisParameter<typeof showTip> {
    const manager = useTipsAndToolsManager();
    const key = useMemo(() => ++sourceKeyCounter, []);
    const source = useMemo<TooltipSource>(() => ({ manager, key }), [manager, key]);
    return showTip.bind(source);
}

interface TooltipSource {
    manager: TooltipManager | null;
    key: number;
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

let sourceKeyCounter = 0;
const useTipsAndToolsManager = () => useContext(TooltipContext);
const TooltipContext = createContext<TooltipManager | null>(null);

class TooltipManager extends PubSub<TooltipProps | null> {
    #active = new Map<number, TooltipProps>();

    addOrUpdate(key: number, reference: VirtualElement, message: string): void {
        const existing = this.#active.get(key);
        if (!existing || (existing.reference !== reference || existing.message !== message)) {
            this.#active.set(key, Object.freeze({ reference, message }));
            this.#notify();
        }
    }

    remove(key: number): void {
        if (this.#active.delete(key)) {
            this.#notify();
        }
    }

    #notify() {
        let last: TooltipProps | null = null;
        for (const value of this.#active.values()) {
            last = value;
        }
        this.pub(last);
    }
}
