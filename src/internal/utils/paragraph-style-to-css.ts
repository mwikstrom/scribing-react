import { CSSProperties } from "react";
import { ParagraphStyle } from "scribing";
import { toPercent, toRem } from "./css-values";

/** @internal */
export const getParagraphCssProperties = (style: ParagraphStyle): CSSProperties => {
    const {
        alignment,
        direction,
        spaceBefore,
        spaceAfter,
    } = style;

    const css: CSSProperties = {};

    if (typeof alignment === "string") {
        css.textAlign = alignment;
    }

    if (typeof direction === "string") {
        css.direction = direction;
    }

    if (typeof spaceBefore === "number") {
        css.marginTop = toRem(spaceBefore/100);
    }

    if (typeof spaceAfter === "number") {
        css.marginBottom = toRem(spaceAfter/100);
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