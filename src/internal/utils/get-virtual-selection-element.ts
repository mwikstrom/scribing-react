import { VirtualElement } from "@popperjs/core";

/**
 * This function is helper for getting the client rect of the current
 * selection of a document.
 * 
 * @remarks
 * There is a special (and odd) case in at least Chrome/Edge that results
 * in the client rect being empty (zero width and zero height). This seems
 * to happen after we've inserted a newline or paragraph break.
 * 
 * This function detects this case and tries to fix it by inserting a
 * "Zero Width Space" into the selection and then immediately removes it. 
 * 
 * NOTE: This hack can only be done when the seleciton is collapsed (= a caret)
 * 
 * @internal
 */
export function getVirtualSelectionElement(
    selection: Selection | null = document.getSelection()
): VirtualElement | null {
    if (selection === null || selection.rangeCount !== 1) {
        return null;
    }

    const range = selection.getRangeAt(0);

    if (!range.collapsed) {
        return range;
    }

    return new VirtualCaret(range);
}

class VirtualCaret {
    #range: Range;
    constructor(range: Range) { this.#range = range; }
    getBoundingClientRect(): DOMRect {
        let rect = this.#range.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
            const tempNode = document.createTextNode("\ufeff");
            this.#range.insertNode(tempNode);
            rect = this.#range.getBoundingClientRect();
            tempNode.remove();
        }    
        return rect;
    }
}