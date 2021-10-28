import { TextRun } from "scribing";
import { getNextDomNode } from "../utils/dom-traversal";
import { isMappedTemplateNode } from "./dom-node";
import { getMappedFlowAxis, NestedFlowPosition } from "./flow-axis";
import { isMappedEditingHost } from "./flow-editing-host";
import { 
    getFlowOffsetFromPreviousSiblings, 
    getFlowSizeFromDomNode, 
    getMappedFlowNode, 
    isMappedFlowNode 
} from "./flow-node";

/** @internal */
export type FlowPath = [number, ...NestedFlowPosition[]];

/** @internal */
export const mapDomPositionToFlow = (
    node: Node | null,
    offset: number,
    editingHost: HTMLElement,
): FlowPath | null => {
    // A null node can't be mapped
    if (node === null) {
        return null;
    }

    // Are we within a text node?
    if (node.nodeType === Node.TEXT_NODE) {
        const { parentNode } = node;

        // A text node without a grand parent can't be mapped
        if (parentNode === null) {
            return null;
        }

        // Is the grand parent node mapped from a text run?
        const grandParentNode = parentNode.parentNode;
        if (grandParentNode !== null && getMappedFlowNode(grandParentNode) instanceof TextRun) {
            // Normally a text run is mapped to a single text node,
            // but here we handle the abnormal case when a text run is
            // mapped to multiple text nodes for some reason.
            // We need to make the offset value relative to the text run
            // and therefore every preceding text node is accounted for.
            while (node.previousSibling) {
                node = node.previousSibling;
                if (node.nodeType === Node.TEXT_NODE) {
                    offset += node.textContent?.length || 0;
                }
            }

            // We also need to take preceeding segments in the same
            // text run.
            for (
                let prevParent = parentNode.previousSibling; 
                prevParent != null; 
                prevParent = prevParent.previousSibling
            ) {
                for (const childNode of prevParent.childNodes) {
                    if (childNode.nodeType === Node.TEXT_NODE) {
                        offset += childNode.textContent?.length || 0;
                    }
                }
            }

            // At this point the offset is relative to the text run so
            // we let the node be the one that the text run is mapped to
            node = grandParentNode;
        } else {
            // Otherwise, we're in a text node that is not the child of
            // a node mapped from a text run. This means that the text node
            // is a formatting symbol or some other content that doesn't
            // make up any actual flow content space. So we're interested
            // in the first ancestor that is mapped from a flow node instead.
            // We can either move up/left or up/right. We want to move up/right
            // in case the selection is within (not at the start of) the mapped
            // ancestor.
            let right = offset > 0 || node.previousSibling !== null;
            offset = 0;
            node = parentNode;
            while (!isMappedFlowNode(node)) {
                // If we reach the root or an editing host, we're out of luck
                if (node.parentNode === null || isMappedEditingHost(node)) {
                    return null;
                }

                // Should we move up/right?
                if (!right && node.previousSibling !== null) {
                    right = true;
                }

                node = node.parentNode;
            }

            // Now, we've moved up to the closest ancestor mapped from a flow node
            // If we've decided to move right we want to go to the next sibling,
            // and if that's not possible (because there isn't one) then we'll
            // adjust the offset to accomodate for the entire flow space of the
            // mapped node.
            if (right) {
                if (node.nextSibling !== null && !isMappedTemplateNode(node.nextSibling)) {
                    node = node.nextSibling;
                } else {
                    offset = getFlowSizeFromDomNode(node);
                }
            }
        }
    } else if (offset >= node.childNodes.length) {
        // Positioned after the last child node. We think of this as being positioned
        // before the next sibling instead (if there is one)
        const next = getNextDomNode(node);
        if (next && !isMappedTemplateNode(next)) {
            node = next;
            offset = 0;
        } else if (node.lastChild !== null) {
            node = node.lastChild;
            offset = getFlowSizeFromDomNode(node);
        } else {
            return null;
        }
    } else if (offset > 0) {
        // At this point: We're not inside a text node but given a non-zero 
        // child offset. So we'll select the closest anchestor mapped from a flow
        // node and compute flow offset by summing up size of preceding siblings
        offset = getFlowOffsetFromPreviousSiblings(node.childNodes.item(offset));
        while (!isMappedFlowNode(node) && !isMappedEditingHost(node) && node.parentNode) {
            offset += getFlowOffsetFromPreviousSiblings(node);
            node = node.parentNode;
        }
    } else {
        offset = 0;
    }

    const nested: NestedFlowPosition[] = [];

    // Now, at this point we've normalized the offset (and node selection) so
    // that the offset is a mapped flow position within that node. All we need
    // to do now is to traverse the DOM tree left/upward and accumulate the
    // flow space that we traverse. We'll stop when we've reached the editing
    // host.
    while (node !== editingHost) {        
        // If we reached another editing host we're out of luck
        if (isMappedEditingHost(node)) {
            return null;
        }

        // Detect if we're traversing through a nested flow
        const outerAxis = getMappedFlowAxis(node);
        if (outerAxis) {
            nested.unshift({
                innerPosition: offset,
                outerAxis,
            });
            offset = 0;
        }

        // Move left as long as we can and sum up the flow space, unless the
        // current node is a template in which case siblings are clones that
        // occupy the same flow space.
        if (!isMappedTemplateNode(node)) {
            while (node.previousSibling) {
                node = node.previousSibling;
                offset += getFlowSizeFromDomNode(node);
            }
        }

        // Move up, we should reach the editing host...
        if (node.parentNode === null) {
            return null;
        }

        node = node.parentNode;
    }

    return [offset, ...nested];
};
