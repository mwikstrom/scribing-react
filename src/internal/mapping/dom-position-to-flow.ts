import { TextRun } from "scribing";
import { isMappedEditingHost } from "./flow-editing-host";
import { getFlowSizeFromDomNode, getMappedFlowNode, isMappedFlowNode } from "./flow-node";

/** @internal */
export const mapDomPositionToFlow = (
    node: Node | null,
    offset: number,
    editingHost: HTMLElement,
): number | null => {
    // A null node can't be mapped
    if (node === null) {
        return null;
    }

    // Are we within a text node?
    if (node.nodeType === Node.TEXT_NODE) {
        const { parentNode } = node;

        // A text node without a parent can't be mapped
        if (parentNode === null) {
            return null;
        }

        // Is the parent node mapped from a text run?
        if (getMappedFlowNode(parentNode) instanceof TextRun) {
            // Normally a text run node is mapped to a single text node,
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

            // At this point the offset is relative to the text run so
            // we let the node be the one that the text run is mapped to
            node = parentNode;
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

            // Now, we've move up to the closest ancestor mapped from a flow node
            // If we've decided to move right we want to go to the next sibling,
            // and if that's not possible (because there isn't one) then we'll
            // adjust the offset to accomodate for the entire flow space of the
            // mapped node.
            if (right) {
                if (node.nextSibling !== null) {
                    node = node.nextSibling;
                } else {
                    offset = getFlowSizeFromDomNode(node);
                }
            }
        }
    } else if (offset > 0) {
        // At this point: We're not inside a text node but given a non-zero 
        // child offset.
        const { childNodes } = node;
        // Is the offset after the last child?
        if (offset >= childNodes.length) {
            // Keep the selected node, but update offset so that we're at the
            // very end of the mapped flow space (if any)
            const nodeSize = getFlowSizeFromDomNode(node);
            offset = nodeSize;
        } else {
            // Select the child node and let offset be zero, as if
            // the dom location were inside that node at the leading position.
            node = childNodes.item(offset);
            offset = 0;
        }
    }

    // Now, at this point we've normalized the offset (and node selection) so
    // that the offset is a mapped flow position within that node. All we need
    // to do know is to traverse the DOM tree left/upward and accumulate the
    // flow space that we traverse. We'll stop when we've reached the editing
    // host.
    while (node !== editingHost) {        
        // If we reached another editing host we're out of luck
        if (isMappedEditingHost(node)) {
            return null;
        }

        // Move left as long as we can and sum up the flow space
        while (node.previousSibling) {
            node = node.previousSibling;
            offset += getFlowSizeFromDomNode(node);
        }

        // Move up, we should reach the editing host...
        if (node.parentNode === null) {
            return null;
        }

        node = node.parentNode;
    }

    return offset;
};
