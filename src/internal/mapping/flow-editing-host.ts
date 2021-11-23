import { FlowEditorState } from "../../FlowEditorState";

/** @internal */
export const setupEditingHostMapping = (
    host: HTMLElement,
    state: FlowEditorState,
): void => void(MAP.set(host, state));

/** @internal */
export const isMappedEditingHost = (node: Node): boolean => MAP.has(node);

const MAP = new WeakMap<Node, FlowEditorState>();
