import { CSSProperties } from "react";
import { ParagraphStyle } from "scribing";

/** @internal */
export const getParagraphCssProperties = (style: ParagraphStyle): CSSProperties => {
    const {
        alignment: textAlign,
        direction,
        lineSpacing,
    } = style;

    const css: CSSProperties = {
        textAlign,
        direction,
        lineHeight: lineSpacingToLineHeight(lineSpacing),
    };

    return css;
};

const lineSpacingToLineHeight = (value: number | undefined): string | undefined => (
    typeof value === "number" ? `${value}%` : undefined
);
