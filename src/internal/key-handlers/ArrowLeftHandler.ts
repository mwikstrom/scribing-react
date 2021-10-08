import { ParagraphBreak } from "scribing";
import { KeyHandler } from "./KeyHandler";

export const ArrowLeftHandler: KeyHandler = (e, state) => {
    // Handle case when moving caret left to avoid ending up after a paragraph break
    if (e.key === "ArrowLeft" && state.selection && state.selection.isCollapsed) {
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
