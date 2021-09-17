import { FlowEditorState } from "scribing";

/** @internal */
export const setupEditingHostMapping = (
    host: HTMLElement,
    state: FlowEditorState,
): (() => void) => {
    MAP.set(host, state);
    return () => {
        if (MAP.get(host) === state) {
            MAP.delete(host);
        }
    };
};

/** @internal */
export const isMappedEditingHost = (node: Node): boolean => MAP.has(node);

const MAP = new WeakMap<Node, FlowEditorState>();
