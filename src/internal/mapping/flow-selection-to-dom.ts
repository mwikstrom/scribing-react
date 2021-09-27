import { FlowSelection, FlowRangeSelection, NestedFlowSelection } from "scribing";
import { FlowAxis, getMappedFlowAxis } from "./flow-axis";
import { isMappedEditingHost } from "./flow-editing-host";
import { isMappedFlowNode } from "./flow-node";
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

        let inner: FlowSelection | null = null;
        container = parent.node.childNodes.item(parent.offset);
        for (const [node, axis] of findAllAxisNodes(container)) {
            inner = axis.getInnerSelection(flowSelection);
            if (inner) {
                container = node;
                break;
            }
        }

        flowSelection = inner;

        if (!flowSelection) {
            console.warn("Unmapped nested flow axis");
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
    } else if (flowSelection) {
        console.warn("Unsupported flow selection type");
    }

    if (!mapped) {
        domSelection.removeAllRanges();
    }
}

export function* findAllAxisNodes(node: Node): Iterable<[Node, FlowAxis]> {
    const axis = getMappedFlowAxis(node);
    
    if (axis) {
        yield [node, axis];
    }

    if (!isMappedFlowNode(node) && !isMappedEditingHost(node)) {
        for (let i = 0; i < node.childNodes.length; ++i) {
            for (const entry of findAllAxisNodes(node.childNodes.item(i))) {
                yield entry;
            }
        }
    }
}
