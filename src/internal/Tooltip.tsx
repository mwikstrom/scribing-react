import { VirtualElement } from "@popperjs/core";
import clsx from "clsx";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { usePopper } from "react-popper";
import { createUseFlowStyles } from "./JssTheming";
import { TooltipMessage } from "./TooltipMessage";
import { SYSTEM_FONT } from "./utils/system-font";
import { useNativeEventHandler } from "./hooks/use-native-event-handler";
import { useTransparentMouseWheel } from "./hooks/use-transparent-mouse-wheel";

/** @internal */
export interface TooltipProps {
    key: number;
    reference: VirtualElement,
    active: boolean;
    content: string;
    boundary?: HTMLElement | null;
}

/** @internal */
export const Tooltip: FC<TooltipProps> = props => {
    const { reference, active, content, boundary: givenBoundary } = props;
    const boundary = givenBoundary ?? "clippingParents";
    const [popper, setPopperState] = useState<HTMLElement | null>(null);
    const [arrow, setArrow] = useState<HTMLElement | null>(null);
    const [stable, setStable] = useState(false);
    const padding = { left: 2, top: 5, right: 2, bottom: 5 };

    const setPopper = useCallback((elem: HTMLElement | null) => {
        setPopperState(elem);
        if (elem) {
            TOOLTIP_NODES.add(elem);
        }
    }, [setPopperState]);

    const { styles, attributes, update } = usePopper(reference, popper, {
        placement: "top",
        modifiers: [
            { name: "arrow", options: { element: arrow } },
            { name: "offset", options: { offset: [0, 10] } },
            { name: "computeStyles", options: { gpuAcceleration: false, adaptive: false } },
            { name: "preventOverflow", options: { boundary, altAxis: true, padding } },
        ],
    });
    
    const classes = useStyles();
    const arrowClassName = clsx(classes.arrow, classes[getArrowPlacementRule(attributes)]);    

    useEffect(() => {
        const delay = active ? 250 : 50;
        const timeout = setTimeout(() => setStable(true), delay);
        return () => clearTimeout(timeout);
    }, [active]);

    useEffect(() => {
        if (update) {
            update();
        }
    }, [content, update]);

    useNativeEventHandler(givenBoundary ?? null, "scroll", () => {
        if (update) {
            update();
        }
    }, [update]);

    const popperProps = {
        ...attributes.popper,
        className: clsx(
            classes.root, 
            active && classes.active,
            stable && classes.stable,
        ), 
        contentEditable: false,
        style: styles.popper,
    };

    const children = useMemo(() => {
        if (typeof content === "string") {
            return <TooltipMessage text={content}/>;
        } else {
            return null;
        }
    }, [content]);

    useTransparentMouseWheel(popper, givenBoundary);

    return (
        <div ref={setPopper} {...popperProps}>
            <div ref={setArrow} className={arrowClassName} style={styles.arrow}/>
            {children}
        </div>
    );
};

/** @internal */
export function isTooltipElement(node: Node | null | undefined): node is HTMLElement {
    return !!node && TOOLTIP_NODES.has(node);
}

/** @internal */
export function getTooltipElement(node: Node | null | undefined): HTMLElement | null {
    if (isTooltipElement(node)) {
        return node;
    } else if (node) {
        return getTooltipElement(node.parentElement);
    } else {
        return null;
    }
}

const useStyles = createUseFlowStyles("Tooltip", ({palette}) => ({
    root: {
        display: "inline-block",
        backgroundColor: palette.tooltip,
        color: palette.tooltipText,
        fontFamily: SYSTEM_FONT,
        fontSize: "0.75rem",
        borderRadius: 4,
        userSelect: "none",
        boxShadow: "0 8px 8px rgba(0,0,0,0.25)",
        opacity: 0,
        transition: "opacity ease-in-out 0.25s",
    },
    active: {
        opacity: 1,
    },
    stable: {
        transition: "opacity ease-in-out 0.25s, left ease-in-out 0.1s",
    },
    arrow: {
        position: "absolute",
        width: 8,
        height: 8,
        visibility: "hidden",
        background: "inherit",
        transition: "left ease-in-out 0.1s",
        "&::before": {
            position: "absolute",
            width: 8,
            height: 8,
            visibility: "visible",
            content: "''",
            transform: "rotate(45deg)",
            background: "inherit",
            boxShadow: "0 8px 8px rgba(0,0,0,0.25)",
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

const TOOLTIP_NODES = new WeakSet<Node>();