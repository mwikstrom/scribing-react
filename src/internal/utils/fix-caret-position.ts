import { ParagraphBreak } from "scribing";
import { getMappedFlowNode } from "../mapping/flow-node";
import { DomPosition } from "../mapping/flow-position-to-dom";
import { getDomPositionFromNode } from "./get-dom-position-from-node";

/**
 * Detects whether the specified caret position is misplaced and if so returns a new position.
 * @internal
 */
export function fixCaretPosition(domPos: DomPosition): DomPosition | null  {
    const { node, offset } = domPos;
    const { childNodes } = node;
    const domSelection = document.getSelection();

    if (!domSelection) {
        return null;
    }

    // Fix when caret is positioned inside a paragraph break
    if ((getMappedFlowNode(node) ?? getMappedFlowNode(node?.parentNode ?? null)) instanceof ParagraphBreak) {
        return getDomPositionFromNode(node);
    }

    // Fix when caret is positioned just after a pargraph break
    if (
        offset > 0 && 
        childNodes.length === offset &&
        getMappedFlowNode(childNodes.item(offset - 1)) instanceof ParagraphBreak
    ) {
        if (domSelection) {
            return { node, offset: offset - 1};
        }
    }

    return null;
}