import { FlowContent, ParagraphBreak } from "scribing";
import { InputHandler } from "./InputHandler";

/** @internal */
export const insertParagraph: InputHandler = controller => {
    const caret = controller.getCaretStyle();

    // Special handling when inserting a paragraph break at the end of a trailing paragraph.
    // In this case we'll insert two paragraph breaks and place the caret between those.
    if (controller.isAtEndOfTrailingParagraph()) {        
        controller.insertContent(new FlowContent({
            nodes: Object.freeze([new ParagraphBreak(), new ParagraphBreak()]),
        }));
        controller.moveCaretBack();
        controller.setCaretStyle(caret);
        return;
    }

    // Special handling when inserting paragraph break inside an empty list item.
    // In this case we'll decrement the list level and potentially exit the list.
    if (controller.isInEmptyListItem()) {
        controller.decrementListLevel();
        return;
    }

    controller.insertNode(new ParagraphBreak());
    controller.setCaretStyle(caret);
};
