import { FlowSelection, FlowRangeSelection, NestedFlowSelection } from "scribing";
import { getNextDomNode } from "../utils/dom-traversal";
import { getMappedFlowAxis } from "./flow-axis";
import { getFlowSizeFromTextNode } from "./flow-node";
import { DomPosition, mapFlowPositionToDom } from "./flow-position-to-dom";

/** @internal */
export interface DomRange {
    anchor: DomPosition;
    focus: DomPosition;
}

/** @internal */
export function mapFlowSelectionToDom(
    flowSelection: FlowSelection | null,
    container: Node,
): DomRange | null {
    while (flowSelection instanceof NestedFlowSelection) {
        const parent = mapFlowPositionToDom(flowSelection.position, container, true);
        
        if (parent === null) {
            break;
        }

        const { node, offset } = parent;

        if (node.nodeType === Node.TEXT_NODE) {
            const textLength = getFlowSizeFromTextNode(node);
            container = node.parentNode ?? node;
            if (offset >= textLength) {
                const nextNode = getNextDomNode(node);
                if (nextNode) {
                    container = nextNode;
                }
            }
        } else if (offset >= 0 && offset < node.childNodes.length) {
            container = node.childNodes.item(offset);
        } else {
            container = node;
        }

        let axis = getMappedFlowAxis(container);
        while (axis === null && container.parentNode !== null) {
            container = container.parentNode;
            axis = getMappedFlowAxis(container);
        }

        const inner = axis?.getInnerSelection(flowSelection);
        if (!inner) {
            console.warn("Unmapped nested flow axis", axis, "for selection", flowSelection);
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
            return { anchor: domAnchor, focus: domFocus };
        }
    }

    if (flowSelection) {
        console.warn("Unmappable flow selection", flowSelection);
    }

    return null;
}

/** @internal */
export function applyFlowSelectionToDom(
    flowSelection: FlowSelection | null,
    container: Node,
    domSelection: Selection,
): void {
    const mapped = mapFlowSelectionToDom(flowSelection, container);
    if (mapped) {
        domSelection.setBaseAndExtent(
            mapped.anchor.node,
            mapped.anchor.offset,
            mapped.focus.node,
            mapped.focus.offset
        );
    } else {
        domSelection.removeAllRanges();
    }
}
