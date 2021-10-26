import { FlowContent, FlowEditorState, FlowSelection, ParagraphBreak } from "scribing";
import { getSelectionFromInput } from "./get-selection-from-input";
import { InputHandler } from "./InputHandler";
import { insertContent } from "./insert-content";

/** @internal */
export const insertParagraph: InputHandler = (event, host, state, pending) => {
    // Special handling when inserting a paragraph break at the end of a trailing paragraph.
    // In this case we'll insert two paragraph breaks and place the caret between those.
    const selection = getSelectionFromInput(event, host);
    if (selection && isAtEndOfTrailingParagraph(selection, state)) {
        const twoParaBreaks = new FlowContent({ nodes: Object.freeze([new ParagraphBreak(), new ParagraphBreak()])});
        const { content: target, theme } = state;
        const insertOp = selection.insert(twoParaBreaks, { target, theme });
        return [insertOp, moveCaretBack];
    }

    return insertContent(event, host, state, pending);
};

function isAtEndOfTrailingParagraph(selection: FlowSelection, state: FlowEditorState): boolean {
    return null !== selection.transformRanges((range, options) => {
        if (options && options.target && range.last === options.target.size) {
            return range;
        } else {
            return null;
        }
    }, { target: state.content, theme: state.theme });
}

function moveCaretBack(state: FlowEditorState): FlowEditorState | null {
    const { selection } = state;
    
    if (selection === null) {
        return null;
    }

    const newSelection = selection.transformRanges(range => range.translate(-1));
    return state.set("selection", newSelection);
}
