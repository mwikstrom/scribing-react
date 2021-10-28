import clsx from "clsx";
import React, { useEffect, useMemo } from "react";
import { FC, useState } from "react";
import { FlowColor, TextStyle } from "scribing";
import { useCaretStyle } from "./CaretStyleScope";
import { useEditMode } from "./EditModeScope";
import { createUseFlowStyles } from "./JssTheming";
import { useParagraphTheme } from "./ParagraphThemeScope";
import { getTextSizeCssProperties } from "./utils/text-style-to-css";

/** @internal */
export interface FlowCaretProps {
    style: TextStyle;
}

/** @internal */
export const FlowCaret: FC<FlowCaretProps> = props => {
    const { style: givenStyle } = props;
    const classes = useStyles();
    const [steady, setSteady] = useState(false);    
    const theme = useParagraphTheme();
    const editMode = useEditMode();
    const caretStyle = useCaretStyle();
    const style = useMemo(() => {
        let ambient = theme.getAmbientTextStyle();
        if (givenStyle.link) {
            ambient = ambient.merge(theme.getLinkStyle());
        }
        return ambient.merge(givenStyle).merge(caretStyle);
    }, [givenStyle, theme, caretStyle]);
    const { bold, italic, color } = style;
    const css = useMemo(() => getTextSizeCssProperties(style), [style]);
    const className = clsx(
        classes.root,
        classes[getColorRule(color)],
        steady && classes.steady,
        bold && classes.bold,
        italic && classes.italic,
    );

    useEffect(() => {
        const timer = setTimeout(() => setSteady(true), 500);
        return () => clearTimeout(timer);
    }, []);

    return editMode !== true ? null : (
        <span className={className} style={css}/>
    );
};

const useStyles = createUseFlowStyles("FlowCaret", ({palette}) => ({
    root: {
        display: "inline",
        pointerEvents: "none",
        outlineColor: "currentcolor",
        outlineStyle: "solid",
        outlineOffset: 0,
        outlineWidth: 1,
        height: "1em",
    },
    bold: {
        outlineWidth: 2,
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
