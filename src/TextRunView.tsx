import clsx from "clsx";
import React, { useMemo } from "react";
import { createUseStyles } from "react-jss";
import { TextRun, TextStyleProps } from "scribing";
import { makeJssId } from "./internal/utils/make-jss-id";
import { getTextCssProperties } from "./internal/utils/text-style-to-css";
import { flowNode } from "./FlowNodeComponent";

export const TextRunView = flowNode<TextRun>((props, ref) => {
    const { node, theme } = props;
    const { text, style: givenStyle } = node;
    const mergedStyle = useMemo(() => {
        let ambient = theme.getAmbientTextStyle();
        if (givenStyle.link) {
            ambient = ambient.merge(theme.getLinkStyle());
        }
        return ambient.merge(givenStyle);
    }, [givenStyle, theme]);
    const css = useMemo(
        () => getTextCssProperties(mergedStyle),
        [mergedStyle]
    );
    const classes = useStyles();
    const colorRule = getColorRule(mergedStyle.color);
    const fontFamilyRule = getFontFamilyRule(mergedStyle.fontFamily);
    return (
        <span
            ref={ref}
            className={clsx(
                classes.root,
                fontFamilyRule && classes[fontFamilyRule],
                colorRule && classes[colorRule],
            )}
            style={css}
            children={text}
        />
    );
});

type FontFamilyClasses = `${Exclude<TextStyleProps["fontFamily"], undefined>}Font`;

type ColorClasses = `${Exclude<TextStyleProps["color"], undefined>}Color`;

const getFontFamilyRule = (value: TextStyleProps["fontFamily"]): FontFamilyClasses | undefined => {
    if (value) {
        return `${value}Font`;
    } else {
        return undefined;
    }
};

const getColorRule = (value: TextStyleProps["color"]): ColorClasses | undefined => {
    if (value) {
        return `${value}Color`;
    } else {
        return undefined;
    }
};

const systemFont = [
    "-apple-system",
    "BlinkMacSystemFont",
    "'Segoe UI'",
    "Roboto",
    "'Helvetica Neue'",
    "Arial",
    "sans-serif",
    "'Apple Color Emoji'",
    "'Segoe UI Emoji'",
    "'Segoe UI Symbol'",
].join(",");

const useStyles = createUseStyles<"root" | FontFamilyClasses | ColorClasses>({
    root: {
        whiteSpace: "pre-wrap", // Preserve white space, wrap as needed
    },
    bodyFont: {
        fontFamily: systemFont,
    },
    headingFont: {
        fontFamily: systemFont,
    },
    monospaceFont: {
        fontFamily: "monospace",
    },
    defaultColor: {
        color: "#212121",
    },
    primaryColor: {
        color: "#304ffe",
    },
    secondaryColor: {
        color: "#8e24aa",
    },
    warningColor: {
        color: "#ef6c00",
    },
    errorColor: {
        color: "#c62828",
    },
    informationColor: {
        color: "#0277bd",
    },
    successColor: {
        color: "#2e7d32",
    },
    subtleColor: {
        color: "#9e9e9e",
    }
}, {
    generateId: makeJssId("TextRun"),
});
