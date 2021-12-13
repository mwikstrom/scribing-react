import { Classes } from "jss";
import { CSSProperties } from "react";
import { TextStyle, TextStyleProps } from "scribing";
import { FlowPalette } from "../../FlowPalette";
import { FlowTypography } from "../../FlowTypography";

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
export const textStyles = (palette: FlowPalette, typography: FlowTypography): TextStyles => ({
    bodyFont: {
        fontFamily: typography.body,
    },
    headingFont: {
        fontFamily: typography.heading,
    },
    monospaceFont: {
        fontFamily: typography.monospace,
    },
    cursiveFont: {
        fontFamily: typography.cursive,
    },
    decorativeFont: {
        fontFamily: typography.decorative,
    },
    defaultColor: {
        color: palette.text,
    },
    primaryColor: {
        color: palette.primary,
    },
    secondaryColor: {
        color: palette.secondary,
    },
    warningColor: {
        color: palette.warning,
    },
    errorColor: {
        color: palette.error,
    },
    informationColor: {
        color: palette.information,
    },
    successColor: {
        color: palette.success,
    },
    subtleColor: {
        color: palette.subtle,
    }
});

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
export const getTextStyleClassProperites = (
    style: TextStyle,
    palette: FlowPalette,
    typography: FlowTypography,
): CSSProperties => {
    let result: CSSProperties = {};
    for (const rule of getTextStyleRules(style)) {
        if (rule) {
            result = { ...result, ...textStyles(palette, typography)[rule] };
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
