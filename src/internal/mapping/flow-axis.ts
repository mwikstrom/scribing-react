import { FlowSelection, NestedFlowSelection } from "scribing";

/** @internal */
export interface NestedFlowPosition {
    innerPosition: number;
    outerAxis: FlowAxis;
}

/** @internal */
export abstract class FlowAxis {
    abstract equals(other: FlowAxis): boolean;

    abstract createNestedSelection(
        outerPosition: number,
        innerSelection: FlowSelection,
    ): NestedFlowSelection;
}

/** @internal */
export const setupFlowAxisMapping = (
    dom: HTMLElement,
    axis: FlowAxis,
): void => void(MAP.set(dom, axis));

/** @internal */
export const getMappedFlowAxis = (node: Node): FlowAxis | null => MAP.get(node) ?? null;

const MAP = new WeakMap<Node, FlowAxis>();
