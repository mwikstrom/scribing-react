import { FlowEditorCommands } from "../../FlowEditorCommands";

/** @internal */
export type KeyHandler = (
    event: KeyboardEvent,
    commands: FlowEditorCommands,
) => void;
