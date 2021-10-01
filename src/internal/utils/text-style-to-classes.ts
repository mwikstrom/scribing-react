import { Classes } from "jss";
import { CSSProperties } from "react";
import { TextStyle, TextStyleProps } from "scribing";
import { SYSTEM_FONT } from "./system-font";

/** @internal */
export type FontFamilyRule = `${Exclude<TextStyleProps["fontFamily"], undefined>}Font`;

/** @internal */
export type ColorRule = `${Exclude<TextStyleProps["color"], undefined>}Color`;

/** @internal */
export type TextStyleRule = FontFamilyRule | ColorRule;

/** @internal */
export type TextStyles = Record<TextStyleRule, CSSProperties>;

/** @internal */
export type TextStyleClasses = Classes<TextStyleRule>;

/** @internal */
export const TEXT_STYLE_CLASSES: TextStyles = {
    bodyFont: {
        fontFamily: SYSTEM_FONT,
    },
    headingFont: {
        fontFamily: SYSTEM_FONT,
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
};

/** @internal */
export const getTextStyleClassNames = (
    style: TextStyle,
    classes: TextStyleClasses
): (string | undefined)[] => getTextStyleRules(style).map(rule => pickClassName(rule, classes));

/** @internal */
export const getTextStyleRules = (
    style: TextStyle,
): (TextStyleRule  | undefined)[] => [
    getFontFamilyRule(style.fontFamily),
    getColorRule(style.color),
];


/** @internal */
export const getTextStyleClassProperites = (style: TextStyle): CSSProperties => {
    let result: CSSProperties = {};
    for (const rule of getTextStyleRules(style)) {
        if (rule) {
            result = { ...result, ...TEXT_STYLE_CLASSES[rule] };
        }
    }
    return result;
};

const pickClassName = (rule: TextStyleRule | undefined, classes: TextStyleClasses): string | undefined => (
    typeof rule === "string" ? classes[rule] : undefined
);

const getFontFamilyRule = (value: TextStyleProps["fontFamily"]): FontFamilyRule | undefined => {
    if (value) {
        return `${value}Font`;
    } else {
        return undefined;
    }
};

const getColorRule = (value: TextStyleProps["color"]): ColorRule | undefined => {
    if (value) {
        return `${value}Color`;
    } else {
        return undefined;
    }
};
