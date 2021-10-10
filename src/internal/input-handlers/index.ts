import { deleteContent } from "./delete-content";
import { InputHandler } from "./InputHandler";
import { insertContent } from "./insert-content";
import { insertText } from "./insert-text";
import { toggleTextStyle } from "./toggle-text-style";

/** @internal */
export const getInputHandler = (inputType: string): InputHandler | null => HANDLERS[inputType] ?? null;

const HANDLERS: Partial<Record<string, InputHandler>> = {
    deleteContentBackward: deleteContent,
    deleteContentForward: deleteContent,
    deleteContent,
    deleteByCut: deleteContent,
    deleteByDrag: deleteContent,
    formatBold: toggleTextStyle("bold"),
    formatItalic: toggleTextStyle("italic"),
    formatUnderline: toggleTextStyle("underline"),
    formatStrikeThrough: toggleTextStyle("strike"),
    insertCompositionText: insertContent,
    insertFromComposition: insertContent,
    insertFromDrop: insertContent,
    insertFromPaste: insertContent,
    // TODO: insertFromPasteAsQuotation: insertContent,
    insertFromYank: insertContent,
    insertLineBreak: insertContent,
    insertParagraph: insertContent,
    insertReplacementText: insertContent,
    insertText: insertText,
    insertTranspose: insertContent,
};