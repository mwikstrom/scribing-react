import { ParagraphBreak } from "scribing";
import { KeyHandler } from "./KeyHandler";

export const ArrowRightHandler: KeyHandler = (e, state) => {
    // Handle case when moving caret right to avoid ending up after a paragraph break
    if (e.key === "ArrowRight" && state.selection && state.selection.isCollapsed) {
        const newSelection = state.selection.transformRanges((range, options = {}) => {
            const { target } = options;
            if (target) {
                const cursor = target.peek(range.last);
                if (cursor.node instanceof ParagraphBreak) {
                    return range.translate(1);
                }
            }
            return null;
        }, { target: state.content });

        if (newSelection) {
            return state.set("selection", newSelection);
        }
    }
};
