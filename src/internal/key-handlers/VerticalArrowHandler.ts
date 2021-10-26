import { ParagraphBreak } from "scribing";
import { getMappedFlowNode } from "../mapping/flow-node";
import { getTooltipElement } from "../Tooltip";
import { getDomPositionFromPoint } from "../utils/get-dom-position-from-point";
import { getSelectionBounary } from "../utils/get-selection-bounary";
import { getClientRectFromDomRange } from "../utils/get-virtual-selection-element";
import { KeyHandler } from "./KeyHandler";

export const VerticalArrowHandler: KeyHandler = e => {
    // Special handling for moving selection focus point up/down.
    //
    // The native handler for up/down isn't good enough when dealing with
    // nested editable flows. It just doesn't work occasionally.
    // Therefore we use the following customization.
    //
    // The idea is to first find the client position (x,y) of the current
    // focus point (which may or may not be a caret) and then move up/down
    // in increments of X pixels until we finds a new caret position (not the
    // one we started at) in a text node.
    //
    // I've chosen X = 10. Moving in increments of 10 pixels seems reasonable, but
    // we might want to adjust that. Optimally we would choose X to be exactly the
    // distance to the next/previous line box (but that distance is not obvious).
    //
    // In addition, we want to avoid ending up just after a paragraph break (similar
    // to how mousedown is handled in the FlowEditor).
    //
    // Finally we need to support the case when user holds down the shift key to just
    // move the focus point (not the caret).

    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") {
        return;
    }

    const domSelection = document.getSelection();
    if (!domSelection) {
        return;
    }

    const { anchorNode, anchorOffset, focusNode, focusOffset } = domSelection;
    if (!anchorNode || !focusNode) {
        return;
    }

    const boundaryNode = getSelectionBounary(anchorNode, anchorOffset);
    if (!boundaryNode) {
        return;
    }

    e.preventDefault();

    const focusRange = document.createRange();
    focusRange.setStart(focusNode, focusOffset);
    focusRange.setEnd(focusNode, focusOffset);
    const focusRect = getClientRectFromDomRange(focusRange);
    const clientX = focusRect.x;
    const deltaY = e.key === "ArrowUp" ? -10 : 10;
    const startY = e.key === "ArrowUp" ? focusRect.top : focusRect.bottom;
    let found: undefined | { node: Node, offset: number, distance: number };

    for (let i = 1; i < 20; ++i) {
        const clientY = startY + i * deltaY;
        let domPos = getDomPositionFromPoint({ clientX, clientY });        

        if (!domPos) {
            continue;
        }

        let { node } = domPos;

        // Ignore tooltip elements - we never move the focus point from editing host
        // to caret by using arrow keys alone.
        const tooltip = getTooltipElement(node);
        if (tooltip) {
            const oldValue = tooltip.style.display;
            tooltip.style.display = "none";
            domPos = getDomPositionFromPoint({ clientX, clientY });
            tooltip.style.display = oldValue;
            if (!domPos) {
                continue;
            }
            node = domPos.node;
        }

        let { offset } = domPos;
        if (node === focusNode && offset === focusOffset) {
            // Still at the same position
            continue;
        }

        if (e.shiftKey && getSelectionBounary(node) !== boundaryNode) {
            // Cannot extend selection cross boundary
            continue;
        }

        // Avoid ending up on the wrong side of a pilcrow.
        const { parentNode } = node;
        if (parentNode && getMappedFlowNode(parentNode) instanceof ParagraphBreak && offset === 1) {
            offset = 0;
        }

        // Check that the discovered position is actually in the intended direction
        const nodeRange = document.createRange();
        nodeRange.setStart(node, offset);
        nodeRange.setEnd(node, offset);
        const nodeRect = getClientRectFromDomRange(nodeRange);
        const distance = deltaY < 0 ? focusRect.top - nodeRect.top : nodeRect.bottom - focusRect.bottom;
        
        if (distance <= 0) {
            // Wrong/no distance
            continue;
        }

        // Stop looking if we've gone too far
        if (found && distance > found.distance + Math.abs(deltaY * 2)) {
            break;
        }

        // Remember it
        found = { node, offset, distance };

        // If it's a text node then it must be the best :-)
        if (node.nodeType === Node.TEXT_NODE) {
            break;
        }
    }

    if (found) {
        const { node, offset } = found;

        // Extend selection or move caret
        if (e.shiftKey) {
            domSelection.extend(node, offset);
        } else {
            domSelection.setBaseAndExtent(node, offset, node, offset);
        }
    }

    return null;        
};
