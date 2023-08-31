import { FlowEditorState } from "../../FlowEditorState";

/** @internal */
export const setupEditingHostMapping = (
    host: HTMLElement,
    state: FlowEditorState,
): void => void(MAP.set(host, state));

/** @internal */
export const isMappedEditingHost = (node: Node): boolean => MAP.has(node);

/** @internal */
export const findMappedEditingHost = (node: HTMLElement | null): HTMLElement | null => {
    if (!node || isMappedEditingHost(node)) {
        return node;
    } else {
        return findMappedEditingHost(node.parentElement);
    }
};

const MAP = new WeakMap<Node, FlowEditorState>();
