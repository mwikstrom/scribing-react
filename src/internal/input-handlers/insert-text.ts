import { TextRun } from "scribing";
import { getMappedFlowNode } from "../mapping/flow-node";
import { InputHandler } from "./InputHandler";
import { insertContent } from "./insert-content";
import { PendingOperation } from "./PendingOperation";

/** @internal */
export const insertText: InputHandler = (event, host, state, pending) => {
    const defaultHandler = () => insertContent(event, host, state, pending);

    // When insertion is made up of basic text (letter, number, punctuators or spaces)
    // into a single collapsed range then we can return a pending operation instead
    // of a real flow operation.
    //
    // The reason we want to do so, is because a pending operation lets the content
    // editable processor handle the change natively, giving us better performance,
    // and also because it won't cause spell checker errors to flicker (since the
    // change is handled natively)

    const { data } = event;
    if (typeof data !== "string" || !/^[\p{L}\p{N}\p{P} ]+$/u.test(data)) {
        // Insertion is not "basic text" -- cannot return pending operation
        return defaultHandler();
    }

    const [range, ...additional] = event.getTargetRanges();
    if (!range.collapsed || additional.length !== 0) {
        // Insertion is not into a single collapsed range -- cannot return pending operation
        return defaultHandler();
    }

    // Determine where the insertion shall be made (target node + text offset)
    const { startContainer: target, startOffset: offset } = range;

    // Is there already a pending operation?
    if (pending !== null) {
        // Can we append to the existing operation?
        if (pending.canAppendAt(target, offset)) {
            return pending.append(data);
        } else {
            return defaultHandler();
        }
    }

    // Verify that the target is inside a text node of a text run
    const { parentNode } = target;
    if (
        target.nodeType !== Node.TEXT_NODE || 
        parentNode === null ||
        !(getMappedFlowNode(parentNode) instanceof TextRun)
    ) {
        // Target is not eliable for pending operation
        return defaultHandler();
    }

    // Compute child index of the target node (text node inside text run)
    let childIndex = 0;
    let prevNode = target.previousSibling;
    while (prevNode !== null) {
        ++childIndex;
        prevNode = target.previousSibling;
    }

    // Return a fresh pending operation
    return new PendingOperation(parentNode, childIndex, offset, data);
};
