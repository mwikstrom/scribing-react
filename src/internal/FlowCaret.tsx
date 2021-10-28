import { VirtualElement } from "@popperjs/core";
import clsx from "clsx";
import React, { useEffect, useMemo } from "react";
import { FC, useState } from "react";
import { usePopper } from "react-popper";
import { FlowColor, FlowContent, FlowSelection, FlowTheme, TextStyle } from "scribing";
import { useNativeEventHandler } from "./hooks/use-native-event-handler";
import { createUseFlowStyles } from "./JssTheming";
import { getVirtualCaretElement } from "./utils/get-virtual-caret-element";
import { isSelectionInside } from "./utils/is-selection-inside";

/** @internal */
export interface FlowCaretProps {
    boundary: HTMLElement | null;
    hidden: boolean;
    selection: FlowSelection | null;
    content: FlowContent;
    theme: FlowTheme;
    caret: TextStyle;
}

/** @internal */
export const FlowCaret: FC<FlowCaretProps> = props => {
    const {
        boundary,
        hidden,
        selection,
        content,
        theme,
        caret,
    } = props;

    // The caret element
    const classes = useStyles();
    const [steady, setSteady] = useState(false);    
    const [reference, setReference] = useState<VirtualElement | null>(null);
    const [popper, setPopper] = useState<HTMLElement | null>(null);
    const [height, setHeight] = useState(0);

    // Apply caret class
    const className = useMemo(() => {
        const style = (selection?.getUniformTextStyle(content, theme) ?? TextStyle.empty).merge(caret);
        const { bold, italic, color } = style;
        return clsx(
            classes.root,
            classes[getColorRule(color)],
            steady && classes.steady,
            bold && classes.bold,
            italic && classes.italic,
        );
    }, [selection, content, theme, caret, steady]);

    // Caret becomes steady after remaining at the same position for 500 ms
    useEffect(() => {
        if (!steady) {
            const timer = setTimeout(() => setSteady(true), 500);
            return () => clearTimeout(timer);
        }
    }, [steady, setSteady]);

    // Track DOM selection
    const [changeCount, setChangeCount] = useState(0);
    useNativeEventHandler(document, "selectionchange", () => setChangeCount(before => before + 1), []);    
    useEffect(() => {
        setSteady(false);
        const domSelection = document.getSelection();        
        if (
            boundary && 
            domSelection && 
            domSelection.isCollapsed && 
            domSelection.rangeCount > 0 &&
            isSelectionInside(boundary, domSelection)
        ) {
            const virtualElement = getVirtualCaretElement(domSelection);
            setReference(virtualElement);
            setHeight(virtualElement?.getBoundingClientRect().height ?? 0);
        } else {
            setReference(null);
        }
    }, [boundary, changeCount, selection, content, theme, caret]);
    
    // Use popper for positioning
    const { styles, attributes, update } = usePopper(reference, popper, {
        placement: "bottom",
        modifiers: [
            { name: "offset", options: { offset: [-1, -height] } },
            { name: "computeStyles", options: { gpuAcceleration: false, adaptive: false } },
        ],
    });

    useNativeEventHandler(boundary ?? null, "scroll", () => {
        if (update) {
            update();
        }
    }, [update]);

    return hidden ? null : (
        <div
            {...attributes.popper}
            ref={setPopper}
            className={className}
            style={{...styles.popper, height}}
        />
    );
};

const useStyles = createUseFlowStyles("FlowCaret", ({palette}) => ({
    root: {
        position: "absolute",
        backgroundColor: "currentcolor",
        width: 2,
    },
    bold: {
        width: 3,
    },
    italic: {
        transform: "rotate(10deg)",
    },
    steady: {
        animationName: "$blink",
        animationDuration: "1060ms",
        animationTimingFunction: "linear",
        animationIterationCount: "infinite",
    },
    defaultColor: {
        color: palette.text,
    },
    subtleColor: {
        color: palette.subtle,
    },
    primaryColor: {
        color: palette.primary,
    },
    secondaryColor: {
        color: palette.secondary,
    },
    successColor: {
        color: palette.success,
    },
    informationColor: {
        color: palette.information,
    },
    warningColor: {
        color: palette.warning,
    },
    errorColor: {
        color: palette.error,
    },
    "@keyframes blink": {
        "0%": { opacity: 0 },
        "50%": { opacity: 0 },
        "51%": { opacity: 1 },
        "100%": { opacity: 1 },
    },
}));

const getColorRule = (color: FlowColor = "default") => `${color}Color` as const;
