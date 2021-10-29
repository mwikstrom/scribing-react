import { FlowEditorCommands } from "../FlowEditorCommands";

/** @internal */
export type InputHandler = (
    commands: FlowEditorCommands,
    event: InputEvent,
) => void;
