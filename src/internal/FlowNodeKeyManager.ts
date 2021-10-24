import { BoxStyle, FlowNode } from "scribing";
import { FlowNodeKeyRenderer } from "./FlowNodeKeyRenderer";

/** @internal */
export class FlowNodeKeyManager {
    #counter = 0;
    #weakMap = new WeakMap<FlowNode | BoxStyle, Map<number, number>>();

    createRenderer(): FlowNodeKeyRenderer {
        return new FlowNodeKeyRenderer(this);
    }

    getNodeKey(node: FlowNode | BoxStyle, repeat = 0): number {
        let map = this.#weakMap.get(node);

        if (!map) {
            map = new Map();
            this.#weakMap.set(node, map);
        }

        let key = map.get(repeat);
        if (!key) {
            key = ++this.#counter;
            map.set(repeat, key);
        }

        return key;
    }
}
