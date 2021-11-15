import { TextRun } from "scribing";
import { getNextDomNode } from "../utils/dom-traversal";
import { isMappedEditingHost } from "./flow-editing-host";
import { getFlowSizeFromDomNode, getFlowSizeFromTextNode, getMappedFlowNode, isMappedFlowNode } from "./flow-node";

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
        if (
            i < (childNodes.length - 1) &&
            (
                position > size || 
                (
                    !preferNested && 
                    position === size
                )
            )
        ) {
            position -= size;
        } else {
            const mapped = mapFlowPositionToDomCore(position, node, preferNested);
            if (!mapped && position === size && node.nextSibling) {
                return mapFlowPositionToDomCore(0, node.nextSibling, preferNested);
            } else {
                return mapped;
            }
        }
    }
    return null;
};

export const mapFlowPositionToDomNode = (
    position: number,
    container: Node,
): Node | null => {
    const domPos = mapFlowPositionToDom(position, container);
    const root = container;
    if (domPos) {
        const { node, offset } = domPos;
        if (node.nodeType === Node.TEXT_NODE) {
            const textLength = getFlowSizeFromTextNode(node);
            container = node.parentNode ?? node;
            if (offset >= textLength) {
                const nextNode = getNextDomNode(node);
                if (nextNode) {
                    container = nextNode;
                }
            }
        } else if (offset >= 0 && offset < node.childNodes.length) {
            container = node.childNodes.item(offset);
        } else {
            container = node;
        }
        while (!isMappedFlowNode(container) && container.parentNode && container.parentNode !== root) {
            container = container.parentNode;
        }
        return container;
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

    const mapped = getMappedFlowNode(container);

    if (mapped instanceof TextRun) {
        let result: DomPosition = { node: container, offset: 0 };
        for (const child of getDescendantTextNodes(container)) {
            const size = getFlowSizeFromTextNode(child);
            result = { node: child, offset: Math.min(size, position) };
            if (position <= size) {
                break;
            } else {
                position -= size;
            }
        }
        return result;
    } else if (
        mapped && 
        !preferNested &&
        container.parentNode && 
        (
            position === 0 || 
            position === mapped.size
        )
    ) {
        const node = container.parentNode;
        let offset = position === 0 ? 0 : 1;
        for (let prev = container.previousSibling; prev; prev = prev.previousSibling) {
            ++offset;
        }
        return { node, offset };
    }

    return mapFlowPositionToDom(position, container, preferNested && !mapped);
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
