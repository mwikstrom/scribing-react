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
        if (rootElementContainsDomRange(rootElement, domRange)) {
            const mapped = mapDomRangeToFlow(domRange, rootElement);
            if (mapped) {
                result.push(mapped);
            }
        }
    }

    return Object.freeze(result);
};

const rootElementContainsDomRange = (rootElement: HTMLElement, { commonAncestorContainer }: Range): boolean => (
    commonAncestorContainer === rootElement || 
    rootElement.contains(commonAncestorContainer)
);

/** @internal */
export const applyFlowRangeArrayToDomSelection = (
    array: readonly FlowRange[],
    domSelection: Selection,
    rootElement: HTMLElement,
): void => {
    const toBeMapped = array
        .map(flowRange => mapFlowRangeToDomRange(flowRange, rootElement))
        .filter(range => range !== null) as DomRange[];
    const unmappedRanges: Range[] = [];
    
    for (let domIndex = 0; domIndex < domSelection.rangeCount; ++domIndex) {
        const domRange = domSelection.getRangeAt(domIndex);
        if (rootElementContainsDomRange(rootElement, domRange)) {
            const flowIndex = toBeMapped.findIndex(mapped => areEqualDomRanges(mapped, domRange));
            if (flowIndex >= 0) {
                toBeMapped.splice(flowIndex, 1);
            } else {
                unmappedRanges.push(domRange);
            }
        }
    }

    for (const range of toBeMapped) {
        let domRange = unmappedRanges.shift();
        const isNew = !domRange;
        if (!domRange) {
            domRange = new Range();
        }
        domRange.setStart(range.start.container, range.start.offset);
        domRange.setEnd(range.end.container, range.end.offset);
        if (isNew) {
            domSelection.addRange(domRange);
        }
    }

    for (const domRange of unmappedRanges) {
        domSelection.removeRange(domRange);
    }
};

const areEqualDomRanges = (mapped: DomRange, dom: AbstractRange): boolean => (
    mapped.start.container === dom.startContainer &&
    mapped.start.offset === dom.startOffset &&
    mapped.end.container === dom.endContainer &&
    mapped.end.offset === dom.endOffset
);

/** @internal */
export const mapFlowRangeToDomRange = (
    flowRange: FlowRange,
    rootElement: HTMLElement,
): DomRange | null => {
    const { anchor, focus, isCollapsed } = flowRange;
    const start = mapFlowPositionToDomLocation(anchor, rootElement);
    if (!start) {
        return null;
    }

    if (isCollapsed) {
        return { start, end: start };
    }

    const end = mapFlowPositionToDomLocation(focus, rootElement);
    if (!end) {
        return null;
    }

    return { start, end };
};

/** @internal */
export const mapDomRangeToFlow = (
    domRange: AbstractRange,
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
    } else if (offset > 0) {
        const { childNodes } = node;
        if (offset >= childNodes.length) {
            const nodeSize = getFlowSizeFromDomNode(node);
            offset = nodeSize;
        } else {
            node = node.childNodes.item(offset);
            offset = 0;
        }
    }

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
export interface DomRange {
    start: DomLocation;
    end: DomLocation;
}

/** @internal */
export interface DomLocation {
    container: Node;
    offset: number;
}

/** @internal */
export const mapFlowPositionToDomLocation = (
    position: number,
    rootElement: HTMLElement,
): DomLocation | null => mapFlowPositionToDomLocationInChildList(position, rootElement);

const mapFlowPositionToDomLocationInChildList = (
    position: number,
    container: Node,
): DomLocation | null => {
    const { childNodes } = container;
    for (let i = 0; i < childNodes.length; ++i) {
        const node = childNodes.item(i);
        const size = getFlowSizeFromDomNode(node);
        if (position > size) {
            position -= size;
        } else {
            const mapped = mapFlowPositionToDomLocationInNode(position, node);
            if (!mapped && position === size) {
                return { container, offset: i + 1 };
            } else {
                return mapped;
            }
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
                result = { container: child, offset: Math.min(size, position) };
                if (position <= size) {
                    break;
                } else {
                    position -= size;
                }
            }
        }
        return result;
    }

    return mapFlowPositionToDomLocationInChildList(position, node);
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
