import { CSSProperties } from "react";
import { TextStyle } from "scribing";

/** @internal */
export const getTextCssProperties = (style: TextStyle): CSSProperties => {
    const {
        bold,
        italic,
        underline,
        strike,
        baseline,
    } = style;

    const css: CSSProperties = {};

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

    if (baseline === "normal") {
        css.verticalAlign = "baseline";
    } else if (baseline !== void(0)) {
        css.verticalAlign = baseline;
    }

    return css;
};

