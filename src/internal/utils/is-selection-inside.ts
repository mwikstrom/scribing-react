import { isInsideBreakOut } from "./break-out";

export function isSelectionInside(
    rootElement: HTMLElement,
    selection: Selection | null,
    requireEditable?: boolean
): boolean {
    if (selection === null) {
        return false;
    }

    const { anchorNode, focusNode } = selection;

    if (!isNodeInside(rootElement, anchorNode, requireEditable)) {
        return false;
    }

    if (focusNode === anchorNode) {
        return true;
    }

    return isNodeInside(rootElement, focusNode, requireEditable);
}

function isNodeInside(root: HTMLElement, node: Node | null, requireEditable: boolean | undefined): boolean {
    if (!node) {
        return false;
    }

    if (!root.contains(node)) {
        return false;
    }

    if (isInsideBreakOut(root, node)) {
        return false;
    }

    if (requireEditable && !isEditable(node)) {
        return false;
    }

    return true;
}

function isEditable(node: Node | null): boolean {
    if (!node) {
        return false;
    } else if (
        node.nodeType === Node.ELEMENT_NODE && 
        "isContentEditable" in node &&
        typeof node["isContentEditable"] === "boolean"
    ) {
        return node["isContentEditable"];
    } else {
        return isEditable(node.parentNode);
    }
}
