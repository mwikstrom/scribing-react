import { BoxStyle, EmptyMarkup, FlowBox, FlowNode, FlowTable, StartMarkup, TableStyle, TextStyle } from "scribing";
import { FlowNodeKeyManager } from "./FlowNodeKeyManager";

/** @internal */
export class FlowNodeKeyRenderer {
    #manager: FlowNodeKeyManager;
    #repeatMap = new Map<NodeMapKey, number>();

    constructor(manager: FlowNodeKeyManager) {
        this.#manager = manager;
    }

    public getNodeKey(node: FlowNode): number {
        const mapKey = getMapKey(node);
        const repeatBefore = this.#repeatMap.get(mapKey) ?? 0;
        const repeatAfter = repeatBefore + 1;
        this.#repeatMap.set(mapKey, repeatAfter);
        return this.#manager.getNodeKey(mapKey, repeatBefore);
    }
}

export type NodeMapKey = FlowNode | BoxStyle | TableStyle | TextStyle;

export const getMapKey = (node: FlowNode): NodeMapKey => {
    if (node instanceof FlowBox ||
        node instanceof FlowTable ||
        node instanceof StartMarkup ||
        node instanceof EmptyMarkup) {
        return node.style;
    } else {
        return node;
    }
};