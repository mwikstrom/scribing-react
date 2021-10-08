import { VirtualElement } from "@popperjs/core";
import React, { createContext, FC, useContext, useEffect, useMemo, useState } from "react";
import { usePopper } from "react-popper";
import { PubSub } from "./utils/PubSub";

/** @public */
export const TipsAndToolsScope: FC = ({children}) => {
    const manager = useMemo(() => new TipsAndToolsManager(), []);
    const [active, setActive] = useState<readonly TipProps[]>([]);
    useEffect(() => manager.sub(setActive), [manager]);
    return (
        <TipsAndToolsContext.Provider value={manager}>
            {children}
            {active.map(props => <Tip {...props}/>)}
        </TipsAndToolsContext.Provider>
    );
};

/** @public */
export function useShowTip(): OmitThisParameter<typeof showTip> {
    const manager = useTipsAndToolsManager();
    const key = useMemo(() => ++sourceKeyCounter, []);
    const source = useMemo<TipsAndToolsSource>(() => ({ manager, key }), [manager, key]);
    return showTip.bind(source);
}

interface TipsAndToolsSource {
    manager: TipsAndToolsManager | null;
    key: number;
}

function showTip(this: TipsAndToolsSource, reference: VirtualElement, message: string): () => void {
    const { manager, key } = this;
    let active = true;
    if (manager) {
        manager.addOrUpdateTip(key, reference, message);
    }
    return () => {
        if (active) {
            active = false;
            if (manager) {
                manager.removeTip(key);
            }
        }
    };
}

let sourceKeyCounter = 0;
const useTipsAndToolsManager = () => useContext(TipsAndToolsContext);
const TipsAndToolsContext = createContext<TipsAndToolsManager | null>(null);

class TipsAndToolsManager extends PubSub<readonly TipProps[]> {
    #active = new Map<number, TipProps>();

    addOrUpdateTip(key: number, reference: VirtualElement, message: string): void {
        const existing = this.#active.get(key);
        if (!existing || (existing.reference !== reference || existing.message !== message)) {
            this.#active.set(key, Object.freeze({ key, reference, message }));
            this.pub(Array.from(this.#active.values()));
        }
    }

    removeTip(key: number): void {
        if (this.#active.delete(key)) {
            this.pub(Array.from(this.#active.values()));
        }
    }
}

interface TipProps {
    key: number;
    reference: VirtualElement,
    message: string;
}

const Tip: FC<TipProps> = props => {
    const { reference, message } = props;
    const [popper, setPopper] = useState<HTMLElement | null>(null);
    const [arrow, setArrow] = useState<HTMLElement | null>(null);
    const { styles, attributes } = usePopper(reference, popper, {
        modifiers: [{ name: "arrow", options: { element: arrow } }],
    });
    return (
        <div ref={setPopper} style={styles.popper} {...attributes.popper}>
            {message}
            <div ref={setArrow} style={styles.arrow}/>
        </div>
    );
};
