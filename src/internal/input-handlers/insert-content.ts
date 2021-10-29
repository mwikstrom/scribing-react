import { getContentFromInput } from "./get-content-from-input";
import { InputHandler } from "./InputHandler";

/** @internal */
export const insertContent: InputHandler = (commands, event) => {
    const content = getContentFromInput(event, commands.getCaretStyle());
    if (content) {
        commands.insertContent(content);
    }
};
