import { arrayType } from "paratype";
import { RefObject, useLayoutEffect } from "react";
import { FlowContent, FlowNode, FlowRange, TextRun } from "scribing";

/** @internal */
export const flowRangeArrayEquals = arrayType(FlowRange.classType).frozen().equals;

/** @internal */
export const mapDomSelectionToFlowRangeArray = (
    domSelection: Selection,
    rootElement: HTMLElement,
): readonly FlowRange[] => {
    const result: FlowRange[] = [];

    for (let i = 0; i < domSelection.rangeCount; ++i) {
        const domRange = domSelection.getRangeAt(i);
        const mapped = mapDomRangeToFlow(domRange, rootElement);
        if (mapped) {
            result.push(mapped);
        }
    }

    return Object.freeze(result);
};

/** @internal */
export const mapFlowRangeArrayToDomSelection = (
    array: readonly FlowRange[],
    domSelection: Selection,
    rootElement: HTMLElement,
): void => {
    domSelection.removeAllRanges();
    for (const item of array) {
        const mapped = mapFlowRangeToDomRange(item, rootElement);
        if (mapped) {
            domSelection.addRange(mapped);
        }
    }
};

/** @internal */
export const mapFlowRangeToDomRange = (
    flowRange: FlowRange,
    rootElement: HTMLElement,
): Range | null => {
    const { anchor, focus, isCollapsed } = flowRange;
    const mappedStart = mapFlowPositionToDomLocation(anchor, rootElement);
    if (!mappedStart) {
        return null;
    }

    let mappedRange: Range | null = new Range();
    mappedRange.setStart(mappedStart.container, mappedStart.offset);

    if (isCollapsed) {
        mappedRange.setEnd(mappedStart.container, mappedStart.offset);        
    } else {
        const mappedEnd = mapFlowPositionToDomLocation(focus, rootElement);
        if (!mappedEnd) {
            mappedRange = null;
        } else {
            mappedRange.setEnd(mappedEnd.container, mappedEnd.offset);
        }
    }

    return mappedRange;
};

/** @internal */
export const mapDomRangeToFlow = (
    domRange: StaticRange,
    rootElement: HTMLElement,
): FlowRange | null => {
    const { startContainer, startOffset, collapsed } = domRange;
    const anchor = mapDomLocationToFlow(startContainer, startOffset, rootElement);

    if (anchor === null) {
        return null;
    }

    if (collapsed) {
        return FlowRange.at(anchor);
    }

    const { endContainer, endOffset } = domRange;
    const focus = mapDomLocationToFlow(endContainer, endOffset, rootElement);

    if (focus === null) {
        return null;
    }

    return new FlowRange({ anchor, focus });
};

/** @internal */
export const mapDomLocationToFlow = (
    node: Node,
    offset: number,
    rootElement: HTMLElement,
): number | null => {
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
    }

    const nodeSize = getFlowSizeFromDomNode(node);
    offset = Math.max(0, Math.min(nodeSize, offset));

    while (node !== rootElement) {
        if (WEAK_ROOT_MAP.has(node)) {
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

/** @internal */
export interface DomLocation {
    container: Node;
    offset: number;
}

/** @internal */
export const mapFlowPositionToDomLocation = (
    position: number,
    rootElement: HTMLElement,
): DomLocation | null => {
    const { childNodes } = rootElement;
    return mapFlowPositionToDomLocationInChildList(position, childNodes);
};

const mapFlowPositionToDomLocationInChildList = (
    position: number,
    childNodes: NodeListOf<ChildNode>,
): DomLocation | null => {
    for (let i = 0; i < childNodes.length; ++i) {
        const node = childNodes.item(i);
        const size = getFlowSizeFromDomNode(node);
        if (position > size) {
            position -= size;
        } else {
            return mapFlowPositionToDomLocationInNode(position, node);
        }
    }
    return null;    
};

const mapFlowPositionToDomLocationInNode = (
    position: number,
    node: Node,
): DomLocation | null => {
    if (position < 0) {
        return null;
    }

    if (WEAK_ROOT_MAP.has(node)) {
        return null;
    }

    if (WEAK_NODE_MAP.get(node) instanceof TextRun) {
        const { childNodes } = node;
        let result: DomLocation = { container: node, offset: 0 };
        for (let i = 0; i < childNodes.length; ++i) {
            const child = childNodes.item(i);
            if (child.nodeType === Node.TEXT_NODE) {
                const size = node.textContent?.length || 0;
                result = { container: node, offset: Math.min(size, position) };
                if (position <= size) {
                    break;
                } else {
                    position -= size;
                }
            }
        }
        return result;
    }

    return mapFlowPositionToDomLocationInChildList(position, node.childNodes);
};

/** @internal */
export const getFlowSizeFromDomNode = (node: Node): number => {
    const mapped = WEAK_NODE_MAP.get(node);
    
    if (mapped) {
        return mapped.size;
    }

    let result = 0;
    node.childNodes.forEach(child => result += getFlowSizeFromDomNode(child));
    return result;
};

/** @internal */
export const registerNodeMapping = (
    domNode: Node,
    flowNode: FlowNode,
): void => void(WEAK_NODE_MAP.set(domNode, flowNode));

/** @internal */
export const useRootMapping = (domRef: RefObject<Node | null>, flowContent: FlowContent): void => {
    useLayoutEffect(() => {
        const { current: domNode } = domRef;
        if (domNode) {
            WEAK_ROOT_MAP.set(domNode, flowContent);
            return () => {
                if (WEAK_ROOT_MAP.get(domNode) === flowContent) {
                    WEAK_ROOT_MAP.delete(domNode);
                }
            };
        }
    }, [domRef.current, flowContent]);
};

/** @internal */
export const useNodeMapping = (domRef: RefObject<Node | null>, flowNode: FlowNode): void => {
    useLayoutEffect(() => {
        const { current: domNode } = domRef;
        if (domNode) {
            WEAK_NODE_MAP.set(domNode, flowNode);
            return () => {
                if (WEAK_NODE_MAP.get(domNode) === flowNode) {
                    WEAK_NODE_MAP.delete(domNode);
                }
            };
        }
    }, [domRef.current, flowNode]);
};

const WEAK_NODE_MAP = new WeakMap<Node, FlowNode>();
const WEAK_ROOT_MAP = new WeakMap<Node, FlowContent>();
