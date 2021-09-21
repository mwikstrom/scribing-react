import jss, { JssStyle } from "jss";
import { ListMarkerKind, ParagraphBreak, ParagraphStyle, TextStyle } from "scribing";
import { makeDynamicJssId } from "./make-jss-id";
import { getTextStyleClassProperites } from "./text-style-to-classes";
import { getTextCssProperties } from "./text-style-to-css";

/** @internal */
export const getListMarkerClass = (
    para: ParagraphStyle,
    text: TextStyle,
    prev: ParagraphBreak | null,
): string | undefined => {
    const {
        listCounterPrefix: prefix = "",
        listCounterSuffix: suffix = "",
        listMarker: kind,
        listLevel: level,
        listCounter: counterReset,
        hideListMarker: hide,
    } = para;

    if (typeof level !== "number" || level <= 0 || !kind) {
        return undefined;
    }

    const counterName = getListCounterName(level);
    const counterStyle = getListCounterStyle(kind, level);
    const marker: JssStyle = {
        ...getTextCssProperties(text),
        ...getTextStyleClassProperites(text),
    };
    const li: JssStyle = {
        counterIncrement: hide ? "none" : getListCounterName(level),        
        "&::marker": marker,
    };

    const continueCounter = (
        counterReset === "resume" ||
        (counterReset === "auto" && prev && (prev.style.listLevel ?? 0) >= level)
    );
    if (!continueCounter) {
        li.counterReset = getListCounterName(level);
        if (typeof counterReset === "number") {
            li.counterReset += ` ${counterReset - 1}`;
        }        
    }

    if (hide) {
        li.listStyleType = "none";
    } else if (isCounterKind(kind)) {
        marker.whiteSpace = "pre";
        marker.content = `'${prefix}' counter(${counterName}, ${counterStyle}) '${suffix}'`;
    } else if (kind === "dash") {
        marker.whiteSpace = "pre";
        marker.content = "'-  '";
    } else {
        li.listStyleType = getListCounterStyle(kind, level);
    }

    const cacheKey = JSON.stringify(li);
    let className = MARKER_CACHE.get(cacheKey);

    if (!className) {
        className = jss.createStyleSheet({
            li
        }, {
            generateId: makeDynamicJssId("Paragraph"),
        }).attach().classes.li;
        MARKER_CACHE.set(cacheKey, className);
    }

    return className;
};

/** @internal */
export const getListCounterName = (level: number):string => `li${level}`;

/** @internal */
export const isCounterKind = (kind: ListMarkerKind): boolean => (
    kind !== "unordered" &&
    kind !== "disc" &&
    kind !== "circle" &&
    kind !== "square" &&
    kind !== "dash"
);

/** @internal */
export const getListCounterStyle = (kind: ListMarkerKind, level: number): string => {
    if (kind === "unordered") {
        return ["disc", "circle", "square"][(level - 1) % 3];
    } else if (kind === "ordered") {
        return ["decimal", "lower-alpha", "lower-roman"][(level - 1) % 3];
    } else {
        return kind;
    }
};

const MARKER_CACHE = new Map<string, string>();
