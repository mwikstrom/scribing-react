import { DomPosition } from "../mapping/flow-position-to-dom";

/** @internal */
export function getDomPositionFromNode(node: Node): DomPosition | null {
    const { parentNode } = node;
    
    if (parentNode === null) {
        return null;
    }

    let offset = 0;
    for (let prev = node.previousSibling; prev !== null; prev = prev.previousSibling) {
        ++offset;
    }

    return { node: parentNode, offset };
}
