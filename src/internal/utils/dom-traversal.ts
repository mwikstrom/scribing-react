/** @internal */
export function getNextDomNode(node: Node): Node | null {
    const { nextSibling } = node;
    
    if (nextSibling != null) {
        return nextSibling;
    }

    const { parentNode } = node;
    if (parentNode != null) {
        return getNextDomNode(parentNode);
    }

    return null;
}
