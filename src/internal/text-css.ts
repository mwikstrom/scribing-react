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

    const css: CSSProperties = {
        whiteSpace: "pre"
    };

    if (typeof bold === "boolean") {
        css.fontWeight = bold ? "bold" : "normal";
    }

    if (typeof italic === "boolean") {
        css.fontStyle = italic ? "italic" : "normal";
    }

    // TODO: Better handling of text decorations.
    // Must be able to support case when for example underline is false AND
    // strike is implied by parent

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
    } else {
        css.verticalAlign = baseline;
    }

    return css;
};

