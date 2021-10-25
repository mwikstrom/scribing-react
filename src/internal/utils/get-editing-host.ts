/** @internal */
export function getEditingHost(node: Node | null): HTMLElement | null {
    if (node === null) {
        return null;
    }
    
    if (
        isElement(node) &&
        node.hasAttribute("contenteditable") &&
        node.getAttribute("contenteditable") !== "false"
    ) {
        return node as HTMLElement;
    }
    
    return getEditingHost(node.parentElement);
}

function isElement(node: Node): node is Element {
    return node.nodeType === Node.ELEMENT_NODE;
}