import { getMappedFlowAxis } from "../mapping/flow-axis";
import { isMappedEditingHost } from "../mapping/flow-editing-host";

/** @internal */
export function getSelectionBounary(node: Node | null, offset?: number): Node | null {
    if (node === null) {
        return null;
    }

    if (
        node.nodeType !== Node.TEXT_NODE &&
        typeof offset === "number" &&
        offset >= 0 &&
        offset < node.childNodes.length
    ) {
        node = node.childNodes.item(offset);
    }

    if (
        isMappedEditingHost(node) ||
        getMappedFlowAxis(node) !== null
    ) {
        return node;
    }
    
    return getSelectionBounary(node.parentNode);
}
