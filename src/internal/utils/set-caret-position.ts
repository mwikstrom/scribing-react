import { DomPosition } from "../mapping/flow-position-to-dom";
import { getEditingHost } from "./get-editing-host";

/** @internal */
export function setCaretPosition(domPos: DomPosition, focus?: boolean): boolean {
    const { node, offset } = domPos;
    const domSelection = document.getSelection();
    if (!domSelection) {
        return false;
    }

    domSelection.setBaseAndExtent(node, offset, node, offset);

    if (focus) {
        getEditingHost(node)?.focus();
    }

    return true;
}