export function isSelectionInside(
    rootElement: HTMLElement,
    selection: Selection | null,
    requireEditable?: boolean
): boolean {
    if (selection === null) {
        return false;
    }

    const { anchorNode, focusNode } = selection;
    if (anchorNode === null || focusNode === null) {
        return false;
    }

    if (!rootElement.contains(anchorNode)) {
        return false;
    }

    if (requireEditable && !isEditable(anchorNode)) {
        return false;
    }

    if (focusNode === anchorNode) {
        return true;
    }

    if (!rootElement.contains(focusNode)) {
        return false;
    }

    if (requireEditable && !isEditable(focusNode)) {
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
