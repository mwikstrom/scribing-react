import { 
    FlowBoxSelection,
    FlowNode, 
    FlowRange, 
    FlowRangeSelection, 
    FlowSelection, 
    InlineNode, 
    NestedFlowSelection, 
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
    if (length === 0) {
        return false;
    }
    const fragmentRange = FlowRange.at(position, size);
    if (outer instanceof NestedFlowSelection) {
        if (fragmentRange.contains(outer.position)) {
            return outer.set("position", outer.position - position);
        } else {
            return false;
        }
    } else if (outer instanceof FlowRangeSelection) {
        const { range } = outer;
        if (range.isCollapsed) {
            const caretPos = range.first;
            if (
                (caretPos > position && caretPos < position + size) ||
                (caretPos === position && placeCaretAtStartOfNode(array, index)) ||
                (caretPos === position + size && placeCaretAtEndOfNode(array, index + length - 1))
            ) {
                return outer.set("range", FlowRange.at(caretPos - position));
            } else {
                return false;
            }
        } else {
            const intersectedRange = range.intersect(FlowRange.at(position, size));
            if (intersectedRange.isCollapsed) {
                return false;
            } else {
                return outer.set("range", intersectedRange.translate(-position));
            }
        }
    } else {
        return outer === true;
    }
}

// Caret shall be placed at tht start of a node when...
const placeCaretAtStartOfNode = (array: readonly FlowNode[], index: number) => (
    // ...it's the first node, or...
    index === 0 ||
    // ...the previous node isn't an inline node
    !(array[index - 1] instanceof InlineNode)
);

// Caret shall be placed at the end of a node when...
const placeCaretAtEndOfNode = (array: readonly FlowNode[], index: number) => (
    // ...it's the last node, or...
    index >= array.length - 1 ||
    // ...the caret can't be placed at the start of the next node.
    !placeCaretAtStartOfNode(array, index + 1)
);