import { FlowEditorState, FlowOperation } from "scribing";
import { PendingOperation } from "./PendingOperation";

/** @internal */
export type InputHandler = (
    event: InputEvent,
    host: HTMLElement,
    state: FlowEditorState,
    pending: PendingOperation | null,
) => (
    FlowOperation | 
    FlowEditorState | 
    PendingOperation | 
    null |
    (
        FlowOperation |
        FlowEditorState |
        null |
        ((state: FlowEditorState) => FlowOperation | FlowEditorState | null)
    )[]
);
