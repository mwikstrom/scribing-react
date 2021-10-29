import { deleteContent, deleteContentBackward, deleteContentForward } from "./delete-content";
import { InputHandler } from "./InputHandler";
import { insertContent } from "./insert-content";
import { insertParagraph } from "./insert-paragraph";
import { toggleTextStyle } from "./toggle-text-style";

/** @internal */
export const getInputHandler = (inputType: string): InputHandler | null => HANDLERS[inputType] ?? null;

const HANDLERS: Partial<Record<string, InputHandler>> = {
    deleteContentBackward,
    deleteContentForward,
    deleteContent,
    deleteByCut: deleteContent,
    deleteByDrag: deleteContent,
    formatBold: toggleTextStyle("bold"),
    formatItalic: toggleTextStyle("italic"),
    formatUnderline: toggleTextStyle("underline"),
    formatStrikeThrough: toggleTextStyle("strike"),
    insertFromComposition: insertContent,
    insertFromDrop: insertContent,
    insertFromPaste: insertContent,
    // TODO: insertFromPasteAsQuotation: insertContent,
    insertFromYank: insertContent,
    insertLineBreak: insertContent,
    insertParagraph: insertParagraph,
    insertReplacementText: insertContent,
    insertText: insertContent,
    insertTranspose: insertContent,
};