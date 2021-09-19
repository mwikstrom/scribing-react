import { FlowNode } from "scribing";

/** @internal */
export const setupFlowNodeMapping = (
    dom: HTMLElement,
    flow: FlowNode,
): void => void(MAP.set(dom, flow));

/** @internal */
export const getMappedFlowNode = (node: Node): FlowNode | null => MAP.get(node) ?? null;

/** @internal */
export const isMappedFlowNode = (node: Node): boolean => MAP.has(node);

/** @internal */
export const getFlowSizeFromDomNode = (node: Node): number => {
    const mapped = getMappedFlowNode(node);
    
    if (mapped) {
        return mapped.size;
    }

    let result = 0;
    node.childNodes.forEach(child => result += getFlowSizeFromDomNode(child));
    return result;
};

const MAP = new WeakMap<Node, FlowNode>();
