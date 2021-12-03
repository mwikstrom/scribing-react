import { FlowEditorController } from "../../FlowEditorController";

/** @internal */
export type KeyHandler = (
    event: KeyboardEvent,
    controller: FlowEditorController,
) => void;
