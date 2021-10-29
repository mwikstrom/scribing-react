import { CSSProperties } from "react";
import { ParagraphStyle, TextStyle } from "scribing";
import { toRem } from "./css-values";
import { getLineHeightProperty } from "./paragraph-style-to-css";

/** @internal */
export const getTextCssProperties = (text: TextStyle, para: ParagraphStyle): CSSProperties => {
    const {
        bold,
        italic,
        underline,
        strike,
    } = text;

    const css = getTextSizeCssProperties(text, para);

    if (typeof bold === "boolean") {
        css.fontWeight = bold ? "bold" : "normal";
    }

    if (typeof italic === "boolean") {
        css.fontStyle = italic ? "italic" : "normal";
    }

    const decorations: string[] = [];
    if (underline === true) {
        decorations.push("underline");
    }
    if (strike === true) {
        decorations.push("line-through");
    }
    if (decorations.length > 0) {
        css.textDecorationLine = decorations.join(" ");
    }

    return css;
};

/** @internal */
export const getTextSizeCssProperties = (text: TextStyle, para: ParagraphStyle): CSSProperties => {
    const {
        baseline,
        fontSize,
    } = text;

    const css: CSSProperties = getLineHeightProperty(para);
    let fontSizeMultiplier = 0.01;

    if (baseline === "normal") {
        css.verticalAlign = "baseline";
    } else if (baseline !== void(0)) {
        css.verticalAlign = baseline;
        fontSizeMultiplier *= 0.75;
    }

    if (typeof fontSize === "number") {
        css.fontSize = toRem(fontSize * fontSizeMultiplier);
    }

    return css;
};
