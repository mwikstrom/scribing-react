import { CSSProperties } from "react";
import { BoxStyle } from "scribing";

/** @internal */
export const getBoxCssProperties = (style: BoxStyle): CSSProperties => {
    const {
        inline
    } = style;

    const css: CSSProperties = {
        display: inline ? "inline-block" : "block",
    };

    return css;
};
