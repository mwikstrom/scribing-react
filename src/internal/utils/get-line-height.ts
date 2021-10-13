/** @internal */
export function getLineHeight(node: Node | null): number {
    if (node !== null && node.nodeType !== Node.ELEMENT_NODE) {
        node = node.parentElement;
    }

    if (isElement(node)) {
        return node.clientHeight * 1.5;
    }

    // Fallback: Why not 20px? :-)
    return 20;
}

function isElement(node: Node | null): node is Element {
    return node !== null && node.nodeType === Node.ELEMENT_NODE;
}