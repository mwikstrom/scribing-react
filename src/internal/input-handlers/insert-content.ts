import { getContentFromInput } from "./get-content-from-input";
import { InputHandler } from "./InputHandler";

/** @internal */
export const insertContent: InputHandler = (commands, event) => {
    const content = getContentFromInput(event, commands);
    if (content) {
        commands.insertContentOrPromise(content);
    }
};
