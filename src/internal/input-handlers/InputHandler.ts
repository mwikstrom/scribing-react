import { FlowEditorController } from "../../FlowEditorController";

/** @internal */
export type InputHandler = (
    controller: FlowEditorController,
    event: InputEvent,
) => void;
