import { FlowRange, FlowSelection, FlowRangeSelection } from "scribing";
import { mapDomPositionToFlow } from "./dom-position-to-flow";

/** @internal */
export function mapDomSelectionToFlow(
    domSelection: Selection | null,
    editingHost: HTMLElement,
): FlowSelection | null {
    if (domSelection === null) {
        return null;
    }
    const { anchorNode, anchorOffset } = domSelection;
    const anchor = mapDomPositionToFlow(anchorNode, anchorOffset, editingHost);
    if (anchor === null) {
        return null;
    }
    
    const { focusNode, focusOffset } = domSelection;
    const focus = domSelection.isCollapsed ? anchor : mapDomPositionToFlow(focusNode, focusOffset, editingHost);
    if (focus === null) {
        return null;
    }

    const range = new FlowRange({ focus, anchor });
    return new FlowRangeSelection({ range });
}