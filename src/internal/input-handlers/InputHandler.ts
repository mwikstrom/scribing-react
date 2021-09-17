import { FlowEditorState, FlowOperation } from "scribing";

/** @internal */
export type InputHandler = (
    event: InputEvent,
    host: HTMLElement,
    state: FlowEditorState,
) => FlowOperation | null;
