import { ParagraphBreak } from "scribing";
import { getBackArrowKey } from "../utils/bidi";
import { KeyHandler } from "./KeyHandler";

export const ArrowBackHandler: KeyHandler = (e, state) => {
    // Handle case when moving caret back to avoid ending up after a paragraph break
    if (state.selection && state.selection.isCollapsed && !e.shiftKey && e.key === getBackArrowKey(state)) {
        const newSelection = state.selection.transformRanges((range, options = {}) => {
            const { target } = options;
            if (target) {
                const cursor = target.peek(range.first);
                if (cursor.offset === 0 && cursor.moveToStartOfPreviousNode()?.node instanceof ParagraphBreak) {
                    return range.translate(-1);
                }
            }
            return null;
        }, { target: state.content });

        if (newSelection) {
            return state.set("selection", newSelection);
        }
    }
};
