import { ParagraphBreak } from "scribing";
import { getForwardArrowKey } from "../utils/bidi";
import { KeyHandler } from "./KeyHandler";

export const ArrowForwardHandler: KeyHandler = (e, state) => {
    // Handle case when moving caret forward to avoid ending up after a paragraph break
    if (state.selection && state.selection.isCollapsed && !e.shiftKey && e.key === getForwardArrowKey(state)) {
        const newSelection = state.selection.transformRanges((range, options = {}) => {
            const { target } = options;
            if (target) {
                const cursor = target.peek(range.last);
                if (cursor.node instanceof ParagraphBreak) {
                    if (range.last < target.size - 1) {
                        return range.translate(1);
                    } else {
                        return range;
                    }
                }
            }
            return null;
        }, { target: state.content });

        if (newSelection) {
            return state.set("selection", newSelection);
        }
    }
};
