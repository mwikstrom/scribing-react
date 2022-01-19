import { Classes, Styles } from "jss";
import { BoxStyle, BoxStyleProps, FlowColor } from "scribing";
import { FlowPalette } from "../../FlowPalette";
import Color from "color";

/** @internal */
export type BoxVariantRule = Exclude<BoxStyleProps["variant"], undefined>;

/** @internal */
export type ColorRule = `${FlowColor}Color`;

/** @internal */
export type BoxStyleRule = BoxVariantRule | ColorRule;

/** @internal */
export type BoxStyles = Styles<BoxStyleRule | "hover" | "disabled">;

/** @internal */
export type BoxStyleClasses = Classes<BoxStyleRule>;

/** @internal */
export const boxStyles = (palette: FlowPalette): BoxStyles => ({
    hover: {},
    disabled: {},
    basic: {},
    outlined: {
        padding: "2px 5px",
        borderWidth: 1,
        borderRadius: 4,
        borderStyle: "solid",
    },
    contained: {
        padding: "2px 5px",
        borderWidth: 1,
        borderRadius: 4,
        borderStyle: "solid",
        "&$defaultColor": {
            borderColor: Color(palette.text).fade(0.85).string(),
            backgroundColor: Color(palette.text).fade(0.85).string(),
            "&$hover:not($disabled)": {
                backgroundColor: Color(palette.text).fade(0.75).string(),
            }
        },
        "&$primaryColor": {
            borderColor: Color(palette.primary).fade(0.85).string(),
            backgroundColor: Color(palette.primary).fade(0.85).string(),
            "&$hover:not($disabled)": {
                backgroundColor: Color(palette.primary).fade(0.75).string(),
            }
        },
        "&$secondaryColor": {
            borderColor: Color(palette.secondary).fade(0.85).string(),
            backgroundColor: Color(palette.secondary).fade(0.85).string(),
            "&$hover:not($disabled)": {
                backgroundColor: Color(palette.secondary).fade(0.75).string(),
            }
        },
        "&$warningColor": {
            borderColor: Color(palette.warning).fade(0.85).string(),
            backgroundColor: Color(palette.warning).fade(0.85).string(),
            "&$hover:not($disabled)": {
                backgroundColor: Color(palette.warning).fade(0.75).string(),
            }
        },
        "&$errorColor": {
            borderColor: Color(palette.error).fade(0.85).string(),
            backgroundColor: Color(palette.error).fade(0.85).string(),
            "&$hover:not($disabled)": {
                backgroundColor: Color(palette.error).fade(0.75).string(),
            }
        },
        "&$informationColor": {
            borderColor: Color(palette.information).fade(0.85).string(),
            backgroundColor: Color(palette.information).fade(0.85).string(),
            "&$hover:not($disabled)": {
                backgroundColor: Color(palette.information).fade(0.75).string(),
            }
        },
        "&$successColor": {
            borderColor: Color(palette.success).fade(0.85).string(),
            backgroundColor: Color(palette.success).fade(0.85).string(),
            "&$hover:not($disabled)": {
                backgroundColor: Color(palette.success).fade(0.75).string(),
            }
        },
        "&$subtleColor": {
            borderColor: Color(palette.subtle).fade(0.85).string(),
            backgroundColor: Color(palette.subtle).fade(0.85).string(),
            "&$hover:not($disabled)": {
                backgroundColor: Color(palette.subtle).fade(0.75).string(),
            }
        }
    },
    alert: {
        padding: "1em",
        borderWidth: 1,
        borderRadius: 4,
        borderStyle: "solid",
        "&$defaultColor": {
            borderColor: Color(palette.text).fade(0.65).string(),
            backgroundColor: Color(palette.text).fade(0.80).string(),
            "&$hover:not($disabled)": {
                backgroundColor: Color(palette.text).fade(0.75).string(),
            }
        },
        "&$primaryColor": {
            borderColor: Color(palette.primary).fade(0.65).string(),
            backgroundColor: Color(palette.primary).fade(0.80).string(),
            "&$hover:not($disabled)": {
                backgroundColor: Color(palette.primary).fade(0.75).string(),
            }
        },
        "&$secondaryColor": {
            borderColor: Color(palette.secondary).fade(0.65).string(),
            backgroundColor: Color(palette.secondary).fade(0.80).string(),
            "&$hover:not($disabled)": {
                backgroundColor: Color(palette.secondary).fade(0.75).string(),
            }
        },
        "&$warningColor": {
            borderColor: Color(palette.warning).fade(0.65).string(),
            backgroundColor: Color(palette.warning).fade(0.80).string(),
            "&$hover:not($disabled)": {
                backgroundColor: Color(palette.warning).fade(0.75).string(),
            }
        },
        "&$errorColor": {
            borderColor: Color(palette.error).fade(0.65).string(),
            backgroundColor: Color(palette.error).fade(0.80).string(),
            "&$hover:not($disabled)": {
                backgroundColor: Color(palette.error).fade(0.75).string(),
            }
        },
        "&$informationColor": {
            borderColor: Color(palette.information).fade(0.65).string(),
            backgroundColor: Color(palette.information).fade(0.80).string(),
            "&$hover:not($disabled)": {
                backgroundColor: Color(palette.information).fade(0.75).string(),
            }
        },
        "&$successColor": {
            borderColor: Color(palette.success).fade(0.65).string(),
            backgroundColor: Color(palette.success).fade(0.80).string(),
            "&$hover:not($disabled)": {
                backgroundColor: Color(palette.success).fade(0.75).string(),
            }
        },
        "&$subtleColor": {
            borderColor: Color(palette.subtle).fade(0.65).string(),
            backgroundColor: Color(palette.subtle).fade(0.80).string(),
            "&$hover:not($disabled)": {
                backgroundColor: Color(palette.subtle).fade(0.75).string(),
            }
        }
    },
    quote: {
        padding: "2px 5px",
        borderLeftWidth: 3,
        borderLeftStyle: "solid",
    },
    defaultColor: {
        borderColor: palette.text,
        "&$hover:not($disabled)": {
            backgroundColor: Color(palette.text).fade(0.87).string(),
        }
    },
    primaryColor: {
        borderColor: palette.primary,
        "&$hover:not($disabled)": {
            backgroundColor: Color(palette.primary).fade(0.87).string(),
        }
    },
    secondaryColor: {
        borderColor: palette.secondary,
        "&$hover:not($disabled)": {
            backgroundColor: Color(palette.secondary).fade(0.87).string(),
        }
    },
    warningColor: {
        borderColor: palette.warning,
        "&$hover:not($disabled)": {
            backgroundColor: Color(palette.warning).fade(0.87).string(),
        }
    },
    errorColor: {
        borderColor: palette.error,
        "&$hover:not($disabled)": {
            backgroundColor: Color(palette.error).fade(0.87).string(),
        }
    },
    informationColor: {
        borderColor: palette.information,
        "&$hover:not($disabled)": {
            backgroundColor: Color(palette.information).fade(0.87).string(),
        }
    },
    successColor: {
        borderColor: palette.success,
        "&$hover:not($disabled)": {
            backgroundColor: Color(palette.success).fade(0.87).string(),
        }
    },
    subtleColor: {
        borderColor: palette.subtle,
        "&$hover:not($disabled)": {
            backgroundColor: Color(palette.subtle).fade(0.87).string(),
        }
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
