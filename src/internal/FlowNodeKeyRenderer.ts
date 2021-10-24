import { BoxStyle, FlowBox, FlowNode } from "scribing";
import { FlowNodeKeyManager } from "./FlowNodeKeyManager";

/** @internal */
export class FlowNodeKeyRenderer {
    #manager: FlowNodeKeyManager;
    #repeatMap = new Map<FlowNode | BoxStyle, number>();

    constructor(manager: FlowNodeKeyManager) {
        this.#manager = manager;
    }

    public getNodeKey(node: FlowNode): number {
        const mapKey = node instanceof FlowBox ? node.style : node;
        const repeatBefore = this.#repeatMap.get(mapKey) ?? 0;
        const repeatAfter = repeatBefore + 1;
        this.#repeatMap.set(mapKey, repeatAfter);
        return this.#manager.getNodeKey(mapKey, repeatBefore);
    }
}