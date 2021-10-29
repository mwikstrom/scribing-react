import clsx from "clsx";
import React, { useMemo } from "react";
import { FC } from "react";
import { FlowColor, TextStyle } from "scribing";
import { useFlowCaretContext } from "./FlowCaretScope";
import { useEditMode } from "./EditModeScope";
import { createUseFlowStyles } from "./JssTheming";
import { useParagraphTheme } from "./ParagraphThemeScope";
import { getTextSizeCssProperties } from "./utils/text-style-to-css";

/** @internal */
export interface FlowCaretProps {
    style?: TextStyle;
}

/** @internal */
export const FlowCaret: FC<FlowCaretProps> = props => {
    const { style: givenStyle = TextStyle.empty } = props;
    const classes = useStyles();
    const theme = useParagraphTheme();
    const editMode = useEditMode();
    const {
        style: caretStyle,
        steady,
        native,
    } = useFlowCaretContext();
    const style = useMemo(() => {
        let ambient = theme.getAmbientTextStyle();
        if (givenStyle.link) {
            ambient = ambient.merge(theme.getLinkStyle());
        }
        return ambient.merge(givenStyle).merge(caretStyle);
    }, [givenStyle, theme, caretStyle]);
    const { bold, italic, color } = style;
    const css = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { lineHeight, ...rest } = getTextSizeCssProperties(style, theme.getAmbientParagraphStyle());
        return rest;
    }, [style, theme]);
    const className = clsx(
        classes.root,
        classes[getColorRule(color)],
        steady && classes.steady,
        bold && classes.bold,
        italic && classes.italic,
    );
    return native || editMode !== true ? null : (
        <span className={className} style={css}/>
    );
};

const useStyles = createUseFlowStyles("FlowCaret", ({palette}) => ({
    root: {
        display: "inline",
        outline: "1px solid currentcolor",
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
