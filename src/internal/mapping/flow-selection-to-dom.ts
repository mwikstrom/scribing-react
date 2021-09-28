import { FlowSelection, FlowRangeSelection, NestedFlowSelection } from "scribing";
import { getMappedFlowAxis } from "./flow-axis";
import { mapFlowPositionToDom } from "./flow-position-to-dom";

/** @internal */
export function mapFlowSelectionToDom(
    flowSelection: FlowSelection | null,
    container: Node,
    domSelection: Selection,
): void {
    let mapped = false;

    while (flowSelection instanceof NestedFlowSelection) {
        const parent = mapFlowPositionToDom(flowSelection.position, container, true);
        
        if (parent === null) {
            break;
        }

        const { node, offset } = parent;

        if (node.nodeType !== Node.TEXT_NODE) {
            container = node.childNodes.item(offset);
        } else if (node.parentNode === null) {
            break;
        } else {
            container = node.parentNode;
        }


        let axis = getMappedFlowAxis(container);
        while (axis === null && container.parentNode !== null) {
            container = container.parentNode;
            axis = getMappedFlowAxis(container);
        }

        const inner = axis?.getInnerSelection(flowSelection);
        if (!inner) {
            console.warn("Unmapped nested flow axis");
            flowSelection = null;
            break;
        }

        flowSelection = inner;
    }

    if (flowSelection instanceof FlowRangeSelection) {
        const { range } = flowSelection;
        const domAnchor = mapFlowPositionToDom(range.anchor, container);
        const domFocus = range.isCollapsed ? domAnchor : mapFlowPositionToDom(range.focus, container);
        if (domAnchor && domFocus) {
            domSelection.setBaseAndExtent(domAnchor.node, domAnchor.offset, domFocus.node, domFocus.offset);
            mapped = true;
        }
    } else if (flowSelection) {
        console.warn("Unsupported flow selection type");
    }

    if (!mapped) {
        domSelection.removeAllRanges();
    }
}
