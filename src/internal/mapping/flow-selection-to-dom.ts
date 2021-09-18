import { FlowSelection, FlowRangeSelection } from "scribing";
import { mapFlowPositionToDom } from "./flow-position-to-dom";

/** @internal */
export function mapFlowSelectionToDom(
    flowSelection: FlowSelection | null,
    editingHost: HTMLElement,
    domSelection: Selection,
): void {
    if (flowSelection instanceof FlowRangeSelection) {
        const { range } = flowSelection;
        const domAnchor = mapFlowPositionToDom(range.anchor, editingHost);
        const domFocus = range.isCollapsed ? domAnchor : mapFlowPositionToDom(range.focus, editingHost);
        if (domAnchor && domFocus) {
            domSelection.setBaseAndExtent(domAnchor.node, domAnchor.offset, domFocus.node, domFocus.offset);
            return;
        }
    }
    domSelection.removeAllRanges();
}
