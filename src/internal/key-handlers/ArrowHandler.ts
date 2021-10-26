import { ParagraphBreak } from "scribing";
import { getMappedFlowNode } from "../mapping/flow-node";
import { getTooltipElement } from "../Tooltip";
import { getBackArrowKey, getForwardArrowKey } from "../utils/bidi";
import { ClientPoint, getDomPositionFromPoint } from "../utils/get-dom-position-from-point";
import { getSelectionBounary } from "../utils/get-selection-bounary";
import { getClientRectFromDomRange } from "../utils/get-virtual-selection-element";
import { KeyHandler } from "./KeyHandler";

export const ArrowHandler: KeyHandler = (e, state) => {
    // Special handling for moving selection focus point.
    //
    // The native handler for this isn't good enough when dealing with
    // nested editable flows. It just doesn't work occasionally.
    // Therefore we use the following customization.
    //
    // The idea is to first find the client position (x,y) of the current
    // focus point (which may or may not be a caret) and then move in a direction
    // in increments of X pixels until we finds a new caret position (not the
    // one we started at) preferrably in a text node.
    //
    // In addition, we want to avoid ending up just after a paragraph break (similar
    // to how mousedown is handled in the FlowEditor).
    //
    // Finally we need to support the case when user holds down the shift key to just
    // move the focus point (not the caret).

    let move: ((extend: boolean) => boolean) | undefined;

    if (e.key === "ArrowUp") {
        move = moveSelectionUp;
    } else if (e.key === "ArrowDown") {
        move = moveSelectionDown;
    } else if (e.key === getBackArrowKey(state)) {
        move = moveSelectionLeft;
    } else if (e.key === getForwardArrowKey(state)) {
        move = moveSelectionRight;
    }

    if (move && move(e.shiftKey)) {
        e.preventDefault();
        return null;
    }
};

/**
 * The number of pixels to move per iteration.
 * Moving in increments of 10 pixels vertically and 3 pixels horizontally seems reasonable, but
 * we might want to adjust that. Optimally we would choose X to be exactly the
 * distance to the next/previous line box (when moving up/down) but that distance 
 * is not easily available.
 */
const DELTA_X = 3;
const DELTA_Y = 10;

const moveSelectionLeft = (extend: boolean) => moveSelectionCore(
    (start, iteration) => ({ clientX: start.x - iteration * DELTA_X, clientY: start.bottom }),
    (start, end) => start.x - end.x,
    extend,
);

const moveSelectionRight = (extend: boolean) => moveSelectionCore(
    (start, iteration) => ({ clientX: start.x + iteration * DELTA_X, clientY: start.bottom }),
    (start, end) => end.x - start.x,
    extend,
);

const moveSelectionUp = (extend: boolean) => moveSelectionCore(
    (start, iteration) => ({ clientX: start.x, clientY: start.top - iteration * DELTA_Y}),
    (start, end) => start.top - end.top,
    extend,
);

const moveSelectionDown = (extend: boolean) => moveSelectionCore(
    (start, iteration) => ({ clientX: start.x, clientY: start.bottom + iteration * DELTA_Y}),
    (start, end) => end.bottom - start.bottom,
    extend,
);

const moveSelectionCore = (
    getPoint: (start: DOMRect, iteration: number) => ClientPoint,
    getDistance: (start: DOMRect, end: DOMRect) => number,
    extend: boolean,
    maxIterations = 50,
    maxDiff = 50,
): boolean => {
    const domSelection = document.getSelection();
    if (!domSelection) {
        return false;
    }

    const { anchorNode, anchorOffset, focusNode, focusOffset } = domSelection;
    if (!anchorNode || !focusNode) {
        return false;
    }

    const boundaryNode = getSelectionBounary(anchorNode, anchorOffset);
    if (!boundaryNode) {
        return false;
    }

    const focusRange = document.createRange();
    focusRange.setStart(focusNode, focusOffset);
    focusRange.setEnd(focusNode, focusOffset);
    const focusRect = getClientRectFromDomRange(focusRange);
    let found: undefined | { node: Node, offset: number, distance: number };

    for (let i = 1; i <= maxIterations; ++i) {
        const clientPoint = getPoint(focusRect, i);
        let domPos = getDomPositionFromPoint(clientPoint);
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
            domPos = getDomPositionFromPoint(clientPoint);
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

        if (extend && getSelectionBounary(node) !== boundaryNode) {
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
        const distance = getDistance(focusRect, nodeRect);
        
        if (distance <= 0) {
            // Wrong/no distance
            continue;
        }

        // Stop looking if we've gone too far
        if (found && distance > found.distance + maxDiff) {
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
        if (extend) {
            domSelection.extend(node, offset);
        } else {
            domSelection.setBaseAndExtent(node, offset, node, offset);
        }

        // TODO: Scroll into view if needed!
    }

    return true;
};
