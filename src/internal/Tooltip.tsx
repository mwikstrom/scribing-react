import { VirtualElement } from "@popperjs/core";
import clsx from "clsx";
import React, { FC, useEffect, useMemo, useState } from "react";
import { usePopper } from "react-popper";
import { FlowEditorCommands } from "./FlowEditorCommands";
import { createUseFlowStyles } from "./JssTheming";
import { TooltipMessage } from "./TooltipMessage";
import { Toolbar } from "./Toolbar";
import { SYSTEM_FONT } from "./utils/system-font";

/** @internal */
export interface TooltipProps {
    key: number;
    reference: VirtualElement,
    active: boolean;
    content: string | FlowEditorCommands;
}

/** @internal */
export const Tooltip: FC<TooltipProps> = props => {
    const { reference, active, content } = props;
    const [popper, setPopper] = useState<HTMLElement | null>(null);
    const [arrow, setArrow] = useState<HTMLElement | null>(null);
    const [stable, setStable] = useState(false);

    const { styles, attributes, update } = usePopper(reference, popper, {
        placement: "top",
        modifiers: [
            { name: "arrow", options: { element: arrow } },
            { name: "offset", options: { offset: [0, 10] } },
            { name: "computeStyles", options: { gpuAcceleration: false, adaptive: false } },
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
        if (content instanceof FlowEditorCommands) {
            return <Toolbar commands={content}/>;
        } else if (typeof content === "string") {
            return <TooltipMessage text={content}/>;
        } else {
            return null;
        }
    }, [content]);

    return (
        <div ref={setPopper} {...popperProps}>
            {children}
            <div ref={setArrow} className={arrowClassName} style={styles.arrow}/>
        </div>
    );
};

const useStyles = createUseFlowStyles("Tooltip", ({palette}) => ({
    root: {
        display: "inline-block",
        backgroundColor: palette.tooltip,
        color: palette.tooltipText,
        fontFamily: SYSTEM_FONT,
        fontSize: "0.75rem",
        borderRadius: 4,
        userSelect: "none",
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
