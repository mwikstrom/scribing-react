import { FlowContent, FlowImage, FlowNode, TextRun, TextStyle } from "scribing";
import { FlowEditorCommands } from "../FlowEditorCommands";
import { createImageSource } from "./create-image-source";

export const isImageFileTransfer = (data: DataTransfer): boolean => getImageFileTransferItems(data).length > 0;

export const getImageFileTransferItems = (data: DataTransfer): DataTransferItem[] => {
    const result: DataTransferItem[] = [];
    for (let i = 0; i < data.items.length; ++i) {
        const item = data.items[i];
        if (item.kind === "file" && /^image\//.test(item.type)) {
            result.push(item);
        }
    }
    return result;
};

export const getFlowContentFromDataTransfer = (
    data: DataTransfer,
    commands: FlowEditorCommands,
): FlowContent | null | Promise<FlowContent>=> {
    if (isImageFileTransfer(data)) {
        return getFlowContentFromImageFileTransfer(data, commands);
    }

    const plainText = data.getData("text/plain");
    if (plainText) {
        return getFlowContentFromPlainText(plainText, commands.getCaretStyle());
    }

    return null;
};

export const getFlowContentFromPlainText = (data: string, caret: TextStyle): FlowContent => {
    // TODO: Split plain text into line breaks and paragraph break
    const normalized = TextRun.normalizeText(data);
    return createFlowContent(new TextRun({ text: normalized, style: caret }));
};

export const getFlowContentFromImageFileTransfer = async (
    data: DataTransfer,
    commands: FlowEditorCommands,
): Promise<FlowContent> => {
    const nodes: FlowNode[] = [];
    for (const item of getImageFileTransferItems(data)) {
        const file = item.getAsFile();
        if (file !== null) {
            const uploadId = commands.uploadAsset(file);
            const source = await createImageSource(file, uploadId);
            nodes.push(new FlowImage({ source, style: commands.getCaretStyle() }));
        }
    }
    return createFlowContent(...nodes);
};

export const createFlowContent = (...nodes: FlowNode[]): FlowContent => new FlowContent({ 
    nodes: Object.freeze(nodes) 
});