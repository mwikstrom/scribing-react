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
    const mergedStyle = useMemo(
        () => theme.getAmbientTextStyle().merge(givenStyle),
        [givenStyle, theme]
    );
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

type FontFamilyClasses = (
    "fontFamilyBody" |
    "fontFamilyHeading" |
    "fontFamilyMonospace"
);

type ColorClasses = (
    "colorDefault" |
    "colorPrimary" |
    "colorSecondary" |
    "colorWarning" |
    "colorError" |
    "colorInformation" |
    "colorSuccess" |
    "colorSubtle"
);

const getFontFamilyRule = (value: TextStyleProps["fontFamily"]): FontFamilyClasses | undefined => {
    if (value === "monospace") {
        return "fontFamilyMonospace";
    } else if (value === "body") {
        return "fontFamilyBody";
    } else if (value === "heading") {
        return "fontFamilyHeading";
    } else {
        return void(0);
    }
};

const getColorRule = (value: TextStyleProps["color"]): ColorClasses | undefined => {
    if (value === "error") {
        return "colorError";
    } else if (value === "default") {
        return "colorDefault";
    } else if (value === "information") {
        return "colorInformation";
    } else if (value === "primary") {
        return "colorPrimary";
    } else if (value === "secondary") {
        return "colorSecondary";
    } else if (value === "success") {
        return "colorSuccess";
    } else if (value === "subtle") {
        return "colorSubtle";
    } else if (value === "warning") {
        return "colorWarning";
    } else {
        return void(0);
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
    fontFamilyBody: {
        fontFamily: systemFont,
    },
    fontFamilyHeading: {
        fontFamily: systemFont,
    },
    fontFamilyMonospace: {
        fontFamily: "monospace",
    },
    colorDefault: {
        color: "#212121",
    },
    colorPrimary: {
        color: "#304ffe",
    },
    colorSecondary: {
        color: "#8e24aa",
    },
    colorWarning: {
        color: "#ef6c00",
    },
    colorError: {
        color: "#c62828",
    },
    colorInformation: {
        color: "#0277bd",
    },
    colorSuccess: {
        color: "#2e7d32",
    },
    colorSubtle: {
        color: "#9e9e9e",
    }
}, {
    generateId: makeJssId("TextRun"),
});
