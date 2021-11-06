import { FlowContent, FlowImage, FlowNode, TextRun, TextStyle } from "scribing";
import { UploadManager } from "../UploadManager";
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
    caret: TextStyle,
    uploadManager: UploadManager,
): FlowContent | null | Promise<FlowContent>=> {
    if (isImageFileTransfer(data)) {
        return getFlowContentFromImageFileTransfer(data, caret, uploadManager);
    }

    const plainText = data.getData("text/plain");
    if (plainText) {
        return getFlowContentFromPlainText(plainText, caret);
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
    caret: TextStyle,
    uploadManager: UploadManager,
): Promise<FlowContent> => {
    const nodes: FlowNode[] = [];
    for (const item of getImageFileTransferItems(data)) {
        const file = item.getAsFile();
        if (file !== null) {
            const upload = uploadManager.begin(file);
            const source = await createImageSource(file, upload.id);
            nodes.push(new FlowImage({ source, style: caret }));
        }
    }
    return createFlowContent(...nodes);
};

export const createFlowContent = (...nodes: FlowNode[]): FlowContent => new FlowContent({ 
    nodes: Object.freeze(nodes) 
});