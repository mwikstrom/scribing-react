import { FlowContent, FlowNode, LineBreak, ParagraphBreak, TextRun, TextStyle } from "scribing";

/** @internal */
export const getContentFromInput = (event: InputEvent, caret: TextStyle): FlowContent | null => {
    const { inputType, dataTransfer } = event;
    let { data } = event;
    const nodes: FlowNode[] = [];

    if (inputType === "insertParagraph") {
        nodes.push(new ParagraphBreak());
    } else if (inputType === "insertLineBreak") {
        nodes.push(new LineBreak({ style: caret }));
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
        const plain = dataTransfer.getData("text/plain");

        if (!plain) {
            // TODO: Add support for text/html too!
            console.warn("Only plain text data transfer is supported");
            return null;
        }

        data = plain;
    }
    
    if (data !== null) {
        // TODO: Split plain text into line breaks and paragraph breaks
        nodes.push(TextRun.fromData({ text: data, style: caret }));
    }

    if (nodes.length === 0) {
        return null;
    }

    Object.freeze(nodes);
    return new FlowContent({ nodes });
};
