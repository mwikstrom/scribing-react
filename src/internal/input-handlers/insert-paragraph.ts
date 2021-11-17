import { FlowContent, ParagraphBreak } from "scribing";
import { InputHandler } from "./InputHandler";

/** @internal */
export const insertParagraph: InputHandler = commands => {
    // Special handling when inserting a paragraph break at the end of a trailing paragraph.
    // In this case we'll insert two paragraph breaks and place the caret between those.
    if (commands.isAtEndOfTrailingParagraph()) {        
        commands.insertContent(new FlowContent({ nodes: Object.freeze([new ParagraphBreak(), new ParagraphBreak()]) }));
        commands.moveCaretBack();
        return;
    }

    // Special handling when inserting paragraph break inside an empty list item.
    // In this case we'll decrement the list level and potentially exit the list.
    if (commands.isInEmptyListItem()) {
        commands.decrementListLevel();
        return;
    }

    commands.insertNode(new ParagraphBreak());
};
