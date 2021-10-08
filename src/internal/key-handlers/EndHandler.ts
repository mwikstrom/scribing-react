import { ParagraphBreak } from "scribing";
import { KeyHandler } from "./KeyHandler";

export const EndHandler: KeyHandler = (e, state) => {
    // Handle case when moving caret to end to avoid ending up after a paragraph break
    if (e.key === "End" && !e.ctrlKey && !e.shiftKey && state.selection && state.selection.isCollapsed) {
        const newSelection = state.selection.transformRanges((range, options = {}) => {
            const { target } = options;
            if (target) {
                const cursor = target.peek(range.last).findNodeForward(n => n instanceof ParagraphBreak);
                if (cursor?.node instanceof ParagraphBreak) {
                    return range.translate(cursor.position - range.last);
                }
            }
            return null;
        }, { target: state.content });

        if (newSelection) {
            return state.set("selection", newSelection);
        }
    }
};
