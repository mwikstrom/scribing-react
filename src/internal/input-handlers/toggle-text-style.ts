import { BooleanTextStyleKeys } from "../../FlowEditorController";
import { InputHandler } from "./InputHandler";

/** @internal */
export const toggleTextStyle = (key: BooleanTextStyleKeys): InputHandler => 
    controller => 
        controller.toggleTextStyle(key);

