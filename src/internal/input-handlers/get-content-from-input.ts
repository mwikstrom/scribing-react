import { FlowContent, LineBreak, ParagraphBreak, TextStyle } from "scribing";
import { UploadManager } from "../UploadManager";
import { createFlowContent, getFlowContentFromDataTransfer, getFlowContentFromPlainText } from "../utils/data-transfer";

/** @internal */
export const getContentFromInput = (
    event: InputEvent,
    caret: TextStyle,
    uploadManager: UploadManager
): FlowContent | null | Promise<FlowContent> => {
    const { inputType, dataTransfer, data } = event;

    if (inputType === "insertParagraph") {
        return createFlowContent(new ParagraphBreak());
    } else if (inputType === "insertLineBreak") {
        return createFlowContent(new LineBreak({ style: caret }));
    } else if (
        inputType !== "insertFromPaste" &&
        inputType !== "insertFromPasteAsQuotation" &&
        inputType !== "insertFromDrop" &&
        inputType !== "insertTranspose" &&
        inputType !== "insertReplacementText" &&
        inputType !== "insertFromYank" &&
        inputType !== "insertText" &&
        inputType !== "insertCompositionText" &&
        inputType !== "insertFromComposition"
    ) {
        return null;
    }

    if (dataTransfer !== null) {
        const content = getFlowContentFromDataTransfer(dataTransfer, caret, uploadManager);
        if (content !== null) {
            return content;
        }
    }
    
    if (data !== null) {
        return getFlowContentFromPlainText(data, caret);
    }

    return null;
};
