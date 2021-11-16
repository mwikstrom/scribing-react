import { FlowSelection, FlowRangeSelection, NestedFlowSelection, FlowTableSelection } from "scribing";
import { FlowAxis, getMappedFlowAxis } from "./flow-axis";
import { isMappedFlowNode } from "./flow-node";
import { DomPosition, mapFlowPositionToDom, mapFlowPositionToDomNode } from "./flow-position-to-dom";

/** @internal */
export interface DomRange {
    anchor: DomPosition;
    focus: DomPosition;
}

/** @internal */
export function mapFlowSelectionToDom(
    flowSelection: FlowSelection | null,
    container: Node,
): DomRange | null | false {
    while (flowSelection instanceof NestedFlowSelection) {
        const mapped = mapFlowPositionToDomNode(flowSelection.position, container);
        
        if (!mapped) {
            break;
        }

        let inner: FlowSelection | null = null;
        for (const [axis, node] of getAxisMappings(mapped, true)) {
            inner = axis.getInnerSelection(flowSelection);
            if (inner !== null) {
                flowSelection = inner;
                container = node;
                break;
            }
        }

        if (inner === null) {
            break;
        }
    }

    if (flowSelection instanceof FlowRangeSelection) {
        const { range } = flowSelection;
        const domAnchor = mapFlowPositionToDom(range.anchor, container);
        const domFocus = range.isCollapsed ? domAnchor : mapFlowPositionToDom(range.focus, container);
        if (domAnchor && domFocus) {
            return { anchor: domAnchor, focus: domFocus };
        }
    }

    if (flowSelection instanceof FlowTableSelection) {
        // Table selection cannot be mapped to dom
        return false;
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
    } else if (mapped === null) {
        domSelection.removeAllRanges();
    }
}

function getAxisMappings(root: Node, descend?: boolean): Iterable<[FlowAxis, Node]> {
    const result: [FlowAxis, Node][] = [];
    const axis = getMappedFlowAxis(root);
    if (axis) {
        result.push([axis, root]);
    } else if (!isMappedFlowNode(root) || descend) {
        for (const child of root.childNodes) {
            for (const entry of getAxisMappings(child)) {
                result.push(entry);
            }
        }
    }
    return result;
}
