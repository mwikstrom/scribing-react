import { FlowSelection } from "scribing";
import { mapDomPositionToFlow } from "./dom-position-to-flow";
import { createFlowSelection, getCommonFlowPath } from "./dom-selection-to-flow";

/** @internal */
export function mapDomRangeToFlow(
    domRange: AbstractRange | null,
    editingHost: HTMLElement,
    backward = false,
): FlowSelection | null {
    if (domRange === null) {
        return null;
    }
    const { startContainer, startOffset, collapsed } = domRange;
    const anchorPath = mapDomPositionToFlow(startContainer, startOffset, editingHost);
    if (anchorPath === null) {
        return null;
    }

    if (collapsed) {
        return createFlowSelection(anchorPath);
    }
    
    const { endContainer, endOffset } = domRange;
    const focusPath = mapDomPositionToFlow(endContainer, endOffset, editingHost);
    if (focusPath === null) {
        return null;
    }

    const {
        commonAnchorPath,
        leafFocusDistance,
    } = getCommonFlowPath(anchorPath, focusPath);

    let flowSelection: FlowSelection | null = createFlowSelection(commonAnchorPath, leafFocusDistance);

    if (backward) {
        flowSelection = flowSelection.transformRanges(range => range.reverse());
    }

    return flowSelection;
}
