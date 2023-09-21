import { FlowContent, FlowImage, FlowNode, InlineNode, TextStyle, deserializeFlowContentFromText } from "scribing";
import { FlowEditorController } from "../../FlowEditorController";
import { createImageSource } from "../../create-image-source";

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
    controller: FlowEditorController,
): FlowContent | null | Promise<FlowContent>=> {
    const jsonFlowContent = data.getData(FlowContent.jsonMimeType);
    if (jsonFlowContent) {
        return FlowContent.fromJsonValue(JSON.parse(jsonFlowContent));
    }

    if (isImageFileTransfer(data)) {
        return getFlowContentFromImageFileTransfer(data, controller);
    }

    const plainText = data.getData("text/plain");
    if (plainText) {
        return getFlowContentFromPlainText(plainText, controller.getCaretStyle());
    }

    return null;
};

export const getFlowContentFromPlainText = (data: string, caret: TextStyle): FlowContent => {
    const content = deserializeFlowContentFromText(data);

    if (caret.isEmpty) {
        return content;
    }

    const nodes: FlowNode[] = [];

    for (let i = 0; i < nodes.length; ++i) {
        if (nodes[i] instanceof InlineNode) {
            nodes[i] = nodes[i].formatText(caret);
        } else {
            break;
        }
    }

    return createFlowContent(...nodes);
};

export const getFlowContentFromImageFileTransfer = async (
    data: DataTransfer,
    controller: FlowEditorController,
): Promise<FlowContent> => {
    const nodes: FlowNode[] = [];
    for (const item of getImageFileTransferItems(data)) {
        const file = item.getAsFile();
        if (file !== null) {
            const uploadId = controller.uploadAsset(file);
            const source = await createImageSource(file, uploadId);
            nodes.push(new FlowImage({ source, style: controller.getCaretStyle(), scale: 1 }));
        }
    }
    return createFlowContent(...nodes);
};

export const createFlowContent = (...nodes: FlowNode[]): FlowContent => new FlowContent({ 
    nodes: Object.freeze(nodes) 
});