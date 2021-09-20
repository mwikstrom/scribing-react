import { CSSProperties } from "react";
import { ParagraphStyle } from "scribing";

/** @internal */
export const getParagraphCssProperties = (style: ParagraphStyle): CSSProperties => {
    const {
        alignment,
        direction,
        lineSpacing,
        spaceAbove,
        spaceBelow,
    } = style;

    const css: CSSProperties = {};

    if (typeof alignment === "string") {
        css.textAlign = alignment;
    }

    if (typeof direction === "string") {
        css.direction = direction;
    }

    if (typeof lineSpacing === "number") {
        css.lineHeight = toPercent(lineSpacing);
    }

    if (typeof spaceAbove === "number") {
        css.marginTop = toRem(spaceAbove);
    }

    if (typeof spaceBelow === "number") {
        css.marginBottom = toRem(spaceBelow);
    }

    return css;
};

const toPercent = (value: number): string => `${value}%`;
const toRem = (value: number): string => `${value / 100}rem`;
