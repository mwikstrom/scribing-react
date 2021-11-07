import { FlowContent, LineBreak, ParagraphBreak } from "scribing";
import { FlowEditorCommands } from "../FlowEditorCommands";
import { createFlowContent, getFlowContentFromDataTransfer, getFlowContentFromPlainText } from "../utils/data-transfer";

/** @internal */
export const getContentFromInput = (
    event: InputEvent,
    commands: FlowEditorCommands,
): FlowContent | null | Promise<FlowContent> => {
    const { inputType, dataTransfer, data } = event;

    if (inputType === "insertParagraph") {
        return createFlowContent(new ParagraphBreak());
    } else if (inputType === "insertLineBreak") {
        return createFlowContent(new LineBreak({ style: commands.getCaretStyle() }));
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
        const content = getFlowContentFromDataTransfer(dataTransfer, commands);
        if (content !== null) {
            return content;
        }
    }
    
    if (data !== null) {
        return getFlowContentFromPlainText(data, commands.getCaretStyle());
    }

    return null;
};
