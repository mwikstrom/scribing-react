import { FlowSelection, FlowRangeSelection, NestedFlowSelection, FlowButtonSelection } from "scribing";
import { mapFlowPositionToDom } from "./flow-position-to-dom";

/** @internal */
export function mapFlowSelectionToDom(
    flowSelection: FlowSelection | null,
    container: Node,
    domSelection: Selection,
): void {
    let mapped = false;

    while (flowSelection instanceof NestedFlowSelection) {
        const parent = mapFlowPositionToDom(flowSelection.position, container);
        
        if (parent === null) {
            break;
        }

        if (flowSelection instanceof FlowButtonSelection) {
            container = parent.node.childNodes.item(parent.offset);
            flowSelection = flowSelection.content;
        } else {
            break;
        }
    }

    if (flowSelection instanceof FlowRangeSelection) {
        const { range } = flowSelection;
        const domAnchor = mapFlowPositionToDom(range.anchor, container);
        const domFocus = range.isCollapsed ? domAnchor : mapFlowPositionToDom(range.focus, container);
        if (domAnchor && domFocus) {
            domSelection.setBaseAndExtent(domAnchor.node, domAnchor.offset, domFocus.node, domFocus.offset);
            mapped = true;
        }
    } else {
        console.warn("Unsupported flow selection type");
    }

    if (!mapped) {
        domSelection.removeAllRanges();
    }
}
