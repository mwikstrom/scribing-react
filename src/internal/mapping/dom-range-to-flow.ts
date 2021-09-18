import { FlowRange, FlowSelection, FlowRangeSelection } from "scribing";
import { mapDomPositionToFlow } from "./dom-position-to-flow";

/** @internal */
export function mapDomRangeToFlow(
    domRange: AbstractRange | null,
    editingHost: HTMLElement,
    backward = false,
): FlowSelection | null {
    if (domRange === null) {
        return null;
    }
    const { startContainer, startOffset } = domRange;
    const anchor = mapDomPositionToFlow(startContainer, startOffset, editingHost);
    if (anchor === null) {
        return null;
    }
    
    const { endContainer, endOffset } = domRange;
    const focus = domRange.collapsed ? anchor : mapDomPositionToFlow(endContainer, endOffset, editingHost);
    if (focus === null) {
        return null;
    }

    let range = new FlowRange({ focus, anchor });

    if (backward) {
        range = range.reverse();
    }

    return new FlowRangeSelection({ range });
}
