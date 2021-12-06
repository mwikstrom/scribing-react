import { JssStyle, create as createJss } from "jss";
import defaultJssPreset from "jss-preset-default";
import { ListMarkerKind, OrderedListMarkerKindType, ParagraphBreak, ParagraphStyle, TextStyle } from "scribing";
import { FlowPalette } from "../../FlowPalette";
import { makeDynamicJssId } from "./make-jss-id";
import { listIndent } from "./paragraph-style-to-classes";
import { getTextStyleClassProperites } from "./text-style-to-classes";
import { getTextCssProperties } from "./text-style-to-css";

/** @internal */
export const getListMarkerClass = (
    para: ParagraphStyle,
    text: TextStyle,
    prev: ParagraphBreak | null,
    palette: FlowPalette
): string | undefined => {
    const {
        listCounterPrefix: prefix = "",
        listCounterSuffix: suffix = "",
        listMarker: kind,
        listLevel: level,
        listCounter: counter,
        hideListMarker: hide,
    } = para;

    if (typeof level !== "number" || level <= 0 || !kind) {
        return undefined;
    }

    const counterName = getListCounterName(level);
    const counterStyle = getListCounterStyle(kind, level);
    const marker: JssStyle = {
        ...getTextCssProperties(text, para),
        ...getTextStyleClassProperites(text, palette),
        display: "inline-block",
        minWidth: listIndent(1),
        textAlign: "end",
    };
    const li: JssStyle = {
        counterIncrement: hide ? "none" : getListCounterName(level),        
        "&::before": marker,
    };

    const continueCounter = (
        counter === "resume" ||
        (counter === "auto" && prev && (prev.style.listLevel ?? 0) >= level)
    );
    if (!continueCounter) {
        li.counterSet = `${getListCounterName(level)} ${typeof counter === "number" ? counter : 1}`;
    }

    if (hide) {
        marker.content ="''";
    } else if (isCounterKind(kind)) {
        marker.whiteSpace = "pre";
        marker.content = `'${prefix}' counter(${counterName}, ${counterStyle}) '${suffix}'`;
    } else {
        marker.whiteSpace = "pre";
        marker.content = `'${getBullet(kind, level)}  '`;
    }

    const cacheKey = JSON.stringify(li);
    let className = MARKER_CACHE.get(cacheKey);

    if (!className) {
        if (!JSS) {
            JSS = createJss().setup(defaultJssPreset());
        }
        className = JSS.createStyleSheet({
            li
        }, {
            generateId: makeDynamicJssId("Paragraph"),
        }).attach().classes.li;
        MARKER_CACHE.set(cacheKey, className);
    }

    return className;
};

let JSS: ReturnType<typeof createJss> | undefined;

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
    if (kind === "ordered") {
        return (["decimal", "lower-alpha", "lower-roman"] as const)[(level - 1) % 3];
    } else if (OrderedListMarkerKindType.test(kind)) {
        return kind;
    } else {
        return "decimal";
    }
};

/** @internal */
export const getBullet = (kind: ListMarkerKind, level: number): string => {
    if (kind === "unordered") {
        kind =  (["disc", "circle", "square"] as const)[(level - 1) % 3];
    }

    switch (kind) {
    case "circle": return "⚬";
    case "dash": return "-";
    case "square": return "▪";
    default:
    case "disc": return "•";
    }
};

const MARKER_CACHE = new Map<string, string>();
