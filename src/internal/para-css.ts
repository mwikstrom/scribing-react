import { CSSProperties } from "react";
import { ParagraphStyle } from "scribing";

/** @internal */
export const getParagraphCssProperties = (style: ParagraphStyle): CSSProperties => {
    const {
        alignment: textAlign,
        direction,
        line_spacing,
    } = style;

    const css: CSSProperties = {
        textAlign,
        direction,
        lineHeight: lineSpacingToLineHeight(line_spacing),
    };

    return css;
};

const lineSpacingToLineHeight = (value: number | undefined): string | undefined => (
    typeof value === "number" ? `${value}%` : undefined
);
