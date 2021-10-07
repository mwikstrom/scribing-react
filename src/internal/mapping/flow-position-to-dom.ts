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
    preferNested?: boolean,
): DomPosition | null => {
    const { childNodes } = container;
    for (let i = 0; i < childNodes.length; ++i) {
        const node = childNodes.item(i);
        const size = getFlowSizeFromDomNode(node);
        if (position > size || (preferNested && position === size)) {
            position -= size;
        } else {
            const mapped = mapFlowPositionToDomCore(position, node, preferNested);
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
    preferNested?: boolean,
): DomPosition | null => {
    if (position < 0) {
        return null;
    }

    if (isMappedEditingHost(container)) {
        return null;
    }

    if (getMappedFlowNode(container) instanceof TextRun) {
        let result: DomPosition = { node: container, offset: 0 };
        for (const child of getDescendantTextNodes(container)) {
            const size = child.textContent?.length || 0;
            result = { node: child, offset: Math.min(size, position) };
            if (position <= size) {
                break;
            } else {
                position -= size;
            }
        }
        return result;
    }

    return mapFlowPositionToDom(position, container, preferNested);
};

function* getDescendantTextNodes(container: Node): Iterable<Node> {
    for (const child of container.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
            yield child;
        } else {
            for (const node of getDescendantTextNodes(child)) {
                yield node;
            }
        }
    }
}
