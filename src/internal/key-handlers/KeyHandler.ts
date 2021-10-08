import { KeyboardEvent } from "react";
import { FlowEditorState, FlowOperation } from "scribing";

/** @internal */
export type KeyHandler = (
    event: KeyboardEvent,
    state: FlowEditorState,
) => FlowOperation | FlowEditorState | null | undefined;
