import { isMappedEditingHost } from "./flow-editing-host";
import { getFlowSizeFromDomNode } from "./flow-node";

/** @internal */
export const mapDomPositionToFlow = (
    node: Node | null,
    offset: number,
    editingHost: HTMLElement,
): number | null => {
    if (node === null) {
        return null;
    }

    if (node.nodeType === Node.TEXT_NODE) {
        while (node.previousSibling) {
            node = node.previousSibling;
            if (node.nodeType === Node.TEXT_NODE) {
                offset += node.textContent?.length || 0;
            }
        }

        if (node.parentNode === null) {
            return null;
        }

        node = node.parentNode;
    } else if (offset > 0) {
        const { childNodes } = node;
        if (offset >= childNodes.length) {
            const nodeSize = getFlowSizeFromDomNode(node);
            offset = nodeSize;
        } else {
            node = childNodes.item(offset);
            offset = 0;
        }
    }

    while (node !== editingHost) {        
        if (isMappedEditingHost(node)) {
            return null;
        }

        while (node.previousSibling) {
            node = node.previousSibling;
            offset += getFlowSizeFromDomNode(node);
        }

        if (node.parentNode === null) {
            return null;
        }

        node = node.parentNode;
    }

    return offset;
};
