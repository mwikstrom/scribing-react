import { KeyHandler } from "./KeyHandler";

export const SetListMarkerHandler: KeyHandler = (e, commands) => {
    // ALT + 0 to ALT + 9 changes list marker kind
    if (e.key >= "0" && e.key <= "9" && !e.ctrlKey && !e.shiftKey && e.altKey) {
        e.preventDefault();
        const kind = ([
            "unordered",    // ALT + SHIFT + 0
            "ordered",      // ALT + SHIFT + 1
            "decimal",      // ALT + SHIFT + 2
            "lower-alpha",  // ALT + SHIFT + 3
            "upper-alpha",  // ALT + SHIFT + 4
            "lower-roman",  // ALT + SHIFT + 5
            "upper-roman",  // ALT + SHIFT + 6
            "disc",         // ALT + SHIFT + 7
            "circle",       // ALT + SHIFT + 8
            "square",       // ALT + SHIFT + 9
        ] as const)[e.key.charCodeAt(0) - "0".charCodeAt(0)];
        if (kind === "ordered" || kind === "unordered") {
            commands.formatList(kind);
        } else {
            commands.formatParagraph("listMarker", kind);
        }
    }
};
