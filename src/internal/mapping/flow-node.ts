import { FlowNode } from "scribing";
import { isMappedTemplateNode } from "./dom-node";

/** @internal */
export const setupFlowNodeMapping = (
    dom: HTMLElement,
    flow: FlowNode,
): void => void(MAP.set(dom, flow));

/** @internal */
export const getMappedFlowNode = (node: Node | null): FlowNode | null => node ? MAP.get(node) ?? null : null;

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

/** @internal */
export const getFlowOffsetFromPreviousSiblings = (node: Node | null): number => {
    let offset = 0;
    if (!isMappedTemplateNode(node)) {
        for (let prev = node?.previousSibling; prev; prev = prev.previousSibling) {
            offset += getFlowSizeFromDomNode(prev);
        }
    }
    return offset;
};

/** @internal */
export const getFlowSizeFromTextNode = (node: Node | null): number => getNormalizedTextNodeOffset(node);

/** @internal */
export const getNormalizedTextNodeOffset = (node: Node | null, offset?: number): number => {
    if (node?.nodeType !== Node.TEXT_NODE) {
        return 0;
    }
    
    const allText = node.textContent ?? "";

    if (offset === void(0)) {
        offset = allText.length;
    } else if (offset <= 0) {
        return 0;
    }

    const textBefore = allText.substr(0, offset);
    const normalizedTextBefore = textBefore.replace(/\u200b/g, "");

    return normalizedTextBefore.length;
};

const MAP = new WeakMap<Node, FlowNode>();
