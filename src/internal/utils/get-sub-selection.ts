import { 
    FlowBoxSelection,
    FlowNode, 
    FlowRange, 
    FlowRangeSelection, 
    FlowSelection, 
    NestedFlowSelection 
} from "scribing";

/** @internal */
export function getFlowNodeSelection(
    outer: boolean | FlowSelection,
    array: readonly FlowNode[],
    index: number,
    node: FlowNode = array[index],   
    position: number = array.slice(0, index).reduce((prev, curr) => prev + curr.size, 0),
): boolean | FlowSelection {
    return getFlowFragmentSelection(outer, array, index, 1, position, node.size);
}

/** @internal */
export function getFlowBoxContentSelection(
    outer: boolean | FlowSelection,
    position = 0,
): boolean | FlowSelection {
    if (outer instanceof FlowBoxSelection && outer.position === position) {
        return outer.content;
    } else if (outer instanceof FlowRangeSelection) {
        return outer.range.contains(position);
    } else {
        return outer === true;
    }
}

/** @internal */
export function getFlowFragmentSelection(
    outer: boolean | FlowSelection,
    array: readonly FlowNode[],
    index: number,
    length: number,
    position: number = array.slice(0, index).reduce((prev, curr) => prev + curr.size, 0),
    size: number = array.slice(index, index + length).reduce((prev, curr) => prev + curr.size, 0),
): boolean | FlowSelection {
    const fragmentRange = FlowRange.at(position, size);
    if (outer instanceof NestedFlowSelection) {
        if (fragmentRange.contains(outer.position)) {
            return outer.set("position", outer.position - position);
        } else {
            return false;
        }
    } else if (outer instanceof FlowRangeSelection) {
        if (!outer.range.isCollapsed) {
            const intersectedRange = outer.range.intersect(FlowRange.at(position, size));
            if (intersectedRange.isCollapsed) {
                return false;
            } else {
                return outer.set("range", intersectedRange.translate(-position));
            }
        } else if (fragmentRange.contains(outer.range.first)) {
            return outer.set("range", outer.range.translate(-position));
        } else {
            return false;
        }
    } else {
        return outer === true;
    }
}
