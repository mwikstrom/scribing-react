import { BooleanTextStyleKeys } from "../../FlowEditorCommands";
import { InputHandler } from "./InputHandler";

/** @internal */
export const toggleTextStyle = (key: BooleanTextStyleKeys): InputHandler => commands => commands.toggleTextStyle(key);

