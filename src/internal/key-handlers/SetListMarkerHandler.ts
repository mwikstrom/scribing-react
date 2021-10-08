import { ParagraphStyle, TargetOptions } from "scribing";
import { KeyHandler } from "./KeyHandler";

export const SetListMarkerHandler: KeyHandler = (e, state) => {
    // ALT + 0 to ALT + 9 changes list marker kind
    if (e.key >= "0" && e.key <= "9" && !e.ctrlKey && !e.shiftKey && e.altKey) {
        if (state.selection) {
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
            const options: TargetOptions = {
                target: state.content,
                theme: state.theme,
            };
            const style = ParagraphStyle.empty.set("listMarker", kind);
            const operation = state.selection.formatParagraph(style, options);
            return operation;
        }

        return null;
    }
};
