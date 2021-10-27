import { ParagraphBreak } from "scribing";
import { getMappedFlowNode } from "../mapping/flow-node";
import { DomPosition } from "../mapping/flow-position-to-dom";

/**
 * Detects whether the specified caret position is misplaced and if so returns a new position.
 * @internal
 */
export function fixCaretPosition(domPos: DomPosition): DomPosition | null  {
    const { node, offset } = domPos;
    const { childNodes } = node;

    if (
        offset > 0 && 
        childNodes.length === offset &&
        getMappedFlowNode(childNodes.item(offset - 1)) instanceof ParagraphBreak
    ) {
        // At this point we've detected that the specified caret position 
        // is on the wrong side of a pilcrow (outside the paragraph). We'll
        // therefore explicitly adjust it so that the caret ends up on
        // the correct side instead.
        const domSelection = document.getSelection();
        if (domSelection) {
            return { node, offset: offset - 1};
        }
    }

    return null;
}