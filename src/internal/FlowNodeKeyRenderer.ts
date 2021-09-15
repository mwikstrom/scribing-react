import { FlowNode } from "scribing";
import { FlowNodeKeyManager } from "./FlowNodeKeyManager";

/** @internal */
export class FlowNodeKeyRenderer {
    #manager: FlowNodeKeyManager;
    #repeatMap = new Map<FlowNode, number>();

    constructor(manager: FlowNodeKeyManager) {
        this.#manager = manager;
    }

    public getNodeKey(node: FlowNode): number {
        const repeatBefore = this.#repeatMap.get(node) ?? 0;
        const repeatAfter = repeatBefore + 1;
        this.#repeatMap.set(node, repeatAfter);
        return this.#manager.getNodeKey(node, repeatBefore);
    }
}