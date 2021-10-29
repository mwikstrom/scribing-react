import { CSSProperties } from "react";
import { ParagraphStyle } from "scribing";
import { toPercent, toRem } from "./css-values";

/** @internal */
export const getParagraphCssProperties = (style: ParagraphStyle): CSSProperties => {
    const {
        alignment,
        direction,
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

    if (typeof spaceAbove === "number") {
        css.marginTop = toRem(spaceAbove/100);
    }

    if (typeof spaceBelow === "number") {
        css.marginBottom = toRem(spaceBelow/100);
    }

    return css;
};

/** @internal */
export const getLineHeightProperty = (style: ParagraphStyle): CSSProperties => {
    const { lineSpacing } = style;
    const css: CSSProperties = {
        lineHeight: toPercent((lineSpacing ?? 100) * 1.5),
    };
    return css;
};