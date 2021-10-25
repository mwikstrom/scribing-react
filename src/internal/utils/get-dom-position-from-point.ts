import { DomPosition } from "../mapping/flow-position-to-dom";

/** @internal */
export interface ClientPoint {
    readonly clientX: number;
    readonly clientY: number;
}

/** @internal */
export function getDomPositionFromPoint(point: ClientPoint): DomPosition | null {
    const { clientX, clientY } = point;
    const doc = document as DocumentExt;
    if (doc.caretRangeFromPoint) {
        const range = doc.caretRangeFromPoint(clientX, clientY);
        if (range) {
            const { startContainer: node, startOffset: offset } = range;
            return { node, offset };
        }
    } else if (doc.caretPositionFromPoint) {
        const pos = doc.caretPositionFromPoint(clientX, clientY);
        if (pos) {
            const { offsetNode: node, offset } = pos;
            return { node, offset };
        }
    }
    return null;
}

interface DocumentExt {
    // Mozilla/Firefox only
    caretPositionFromPoint?: (x: number, y: number) => CaretPosition;

    // All other modern browsers
    caretRangeFromPoint?: (x: number, y: number) => AbstractRange;
}

interface CaretPosition {
    readonly offsetNode: Node;
    readonly offset: number;
}