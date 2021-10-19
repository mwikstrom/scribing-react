import { Classes, Styles } from "jss";
import { BoxStyle, BoxStyleProps, FlowColor } from "scribing";
import { FlowPalette } from "../../FlowPalette";

/** @internal */
export type BoxVariantRule = Exclude<BoxStyleProps["variant"], undefined>;

/** @internal */
export type ColorRule = `${FlowColor}Color`;

/** @internal */
export type BoxStyleRule = BoxVariantRule | ColorRule;

/** @internal */
export type BoxStyles = Styles<BoxStyleRule>;

/** @internal */
export type BoxStyleClasses = Classes<BoxStyleRule>;

/** @internal */
export const boxStyles = (palette: FlowPalette): BoxStyles => ({
    basic: {},
    outlined: {
        borderWidth: 1,
        borderRadius: 2,
        borderStyle: "solid",
    },
    contained: {},
    alert: {},
    quote: {},
    defaultColor: {
        borderColor: palette.text,
    },
    primaryColor: {
        borderColor: palette.primary,
    },
    secondaryColor: {
        borderColor: palette.secondary,
    },
    warningColor: {
        borderColor: palette.warning,
    },
    errorColor: {
        borderColor: palette.error,
    },
    informationColor: {
        borderColor: palette.information,
    },
    successColor: {
        borderColor: palette.success,
    },
    subtleColor: {
        borderColor: palette.subtle,
    }
});

/** @internal */
export const getBoxStyleClassNames = (
    style: BoxStyle,
    classes: BoxStyleClasses
): string[] => {
    const {  variant = "basic", color = "default" } = style;
    const result = [classes[variant], classes[getColorRule(color)]];
    return result;
};

const getColorRule = (value: FlowColor): ColorRule => {
    return `${value}Color`;
};
