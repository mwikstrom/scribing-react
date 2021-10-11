import { VirtualElement } from "@popperjs/core";
import clsx from "clsx";
import React, { FC, useState } from "react";
import { usePopper } from "react-popper";
import { createUseFlowStyles } from "./JssTheming";
import { SYSTEM_FONT } from "./utils/system-font";

/** @internal */
export interface TooltipProps {
    reference: VirtualElement,
    message: string;
}

/** @internal */
export const Tooltip: FC<TooltipProps> = props => {
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
