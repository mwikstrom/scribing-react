import { TextRun } from "scribing";
import { isMappedEditingHost } from "./flow-editing-host";
import { getFlowSizeFromDomNode, getMappedFlowNode } from "./flow-node";

export interface DomPosition {
    node: Node,
    offset: number,
}

export const mapFlowPositionToDom = (
    position: number,
    container: Node,
): DomPosition | null => {
    const { childNodes } = container;
    for (let i = 0; i < childNodes.length; ++i) {
        const node = childNodes.item(i);
        const size = getFlowSizeFromDomNode(node);
        if (position > size) {
            position -= size;
        } else {
            const mapped = mapFlowPositionToDomCore(position, node);
            if (!mapped && position === size && (i + 1) < childNodes.length) {
                return { node: container, offset: i + 1 };
            } else {
                return mapped;
            }
        }
    }
    return null;
};

const mapFlowPositionToDomCore = (
    position: number,
    container: Node,
): DomPosition | null => {
    if (position < 0) {
        return null;
    }

    if (isMappedEditingHost(container)) {
        return null;
    }

    if (getMappedFlowNode(container) instanceof TextRun) {
        const { childNodes } = container;
        let result: DomPosition = { node: container, offset: 0 };
        for (let i = 0; i < childNodes.length; ++i) {
            const child = childNodes.item(i);
            if (child.nodeType === Node.TEXT_NODE) {
                const size = child.textContent?.length || 0;
                result = { node: child, offset: Math.min(size, position) };
                if (position <= size) {
                    break;
                } else {
                    position -= size;
                }
            }
        }
        return result;
    }

    return mapFlowPositionToDom(position, container);
};
