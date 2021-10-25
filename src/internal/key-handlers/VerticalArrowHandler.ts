import { ParagraphBreak } from "scribing";
import { getMappedFlowNode } from "../mapping/flow-node";
import { getDomPositionFromPoint } from "../utils/get-dom-position-from-point";
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

    const { focusNode, focusOffset } = domSelection;
    if (!focusNode) {
        return;
    }

    const focusRange = document.createRange();
    focusRange.setStart(focusNode, focusOffset);
    focusRange.setEnd(focusNode, focusOffset);
    const focusRect = focusRange.getBoundingClientRect();
    const clientX = focusRect.x;
    const deltaY = e.key === "ArrowUp" ? -10 : 10;
    const startY = e.key === "ArrowUp" ? focusRect.top : focusRect.bottom;

    for (let i = 1; i < 20; ++i) {
        const clientY = startY + i * deltaY;
        const domPos = getDomPositionFromPoint({ clientX, clientY });

        if (!domPos) {
            continue;
        }

        const { node } = domPos;
        let { offset } = domPos;

        if (node === focusNode && offset === focusOffset) {
            // Still at the same position
            continue;
        }

        // TODO: Ignore nodes that are in the wrong direction

        // TODO: Fallback to non-text node

        if (node.nodeType !== Node.TEXT_NODE) {
            // We're looking for a text node. This could be improved so that
            // we support other nodes too - but I'm too lazy for that now.
            continue;
        }

        // Avoid ending up on the wrong side of a pilcrow.
        const { parentNode } = node;
        if (parentNode && getMappedFlowNode(parentNode) instanceof ParagraphBreak && offset === 1) {
            offset = 0;
        }

        // Extend selection or move caret
        if (e.shiftKey) {
            // TODO: When extending selection we must make sure that the focus point and anchor point
            // are within the same flow, since we currently don't support multi-range selections.
            domSelection.extend(node, offset);
        } else {
            domSelection.setBaseAndExtent(node, offset, node, offset);
        }

        e.preventDefault();
        return null;
    }
};
