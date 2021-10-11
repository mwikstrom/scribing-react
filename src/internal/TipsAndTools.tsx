import { VirtualElement } from "@popperjs/core";
import clsx from "clsx";
import React, { createContext, FC, useContext, useEffect, useMemo, useState } from "react";
import { usePopper } from "react-popper";
import { createUseFlowStyles } from "./JssTheming";
import { PubSub } from "./utils/PubSub";
import { SYSTEM_FONT } from "./utils/system-font";

/** @internal */
export const TipsAndToolsScope: FC = ({children}) => {
    const manager = useMemo(() => new TipsAndToolsManager(), []);
    const [active, setActive] = useState<TooltipProps | null>(manager.current || null);
    useEffect(() => manager.sub(setActive), [manager]);
    return (
        <TipsAndToolsContext.Provider value={manager}>
            {children}
            {active && <Tooltip {...active}/>}
        </TipsAndToolsContext.Provider>
    );
};

/** @internal */
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
const useTipsAndToolsManager = () => useContext(TipsAndToolsContext);
const TipsAndToolsContext = createContext<TipsAndToolsManager | null>(null);

class TipsAndToolsManager extends PubSub<TooltipProps | null> {
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

interface TooltipProps {
    reference: VirtualElement,
    message: string;
}

const Tooltip: FC<TooltipProps> = props => {
    const { reference, message } = props;
    const [popper, setPopper] = useState<HTMLElement | null>(null);
    const [arrow, setArrow] = useState<HTMLElement | null>(null);
    const { styles, attributes } = usePopper(reference, popper, {
        placement: "top",
        modifiers: [
            { name: "arrow", options: { element: arrow } },
            { name: "offset", options: { offset: [0, 10] } },
        ],
    });
    const classes = useStyles();
    const arrowClassName = clsx(classes.arrow, classes[getArrowPlacementRule(attributes)]);
    return (
        <div ref={setPopper} className={classes.root} style={styles.popper} {...attributes.popper}>
            {message}
            <div ref={setArrow} className={arrowClassName} style={styles.arrow}/>
        </div>
    );
};

const useStyles = createUseFlowStyles("ToolPopper", ({palette}) => ({
    root: {
        display: "inline-block",
        backgroundColor: palette.tooltip,
        color: palette.tooltipText,
        fontFamily: SYSTEM_FONT,
        fontSize: "0.75rem",
        borderRadius: 4,
        padding: "0.5rem 1rem",
    },
    arrow: {
        position: "absolute",
        width: 8,
        height: 8,
        visibility: "hidden",
        background: "inherit",
        "&::before": {
            position: "absolute",
            width: 8,
            height: 8,
            visibility: "visible",
            content: "''",
            transform: "rotate(45deg)",
            background: "inherit",
        }
    },
    arrowTop: {
        bottom: -4,
    },
    arrowBottom: {
        top: -4,
    },
}));

const getArrowPlacementRule = (
    attributes: Partial<Record<string, Record<string, string>>>,
): "arrowTop" | "arrowBottom" => {
    const { popper } = attributes;
    if (popper) {
        const { "data-popper-placement": placement } = popper;
        if (placement === "bottom") {
            return "arrowBottom";
        }
    }
    return "arrowTop";
};
