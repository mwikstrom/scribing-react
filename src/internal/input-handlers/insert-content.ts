import { getContentFromInput } from "./get-content-from-input";
import { InputHandler } from "./InputHandler";

/** @internal */
export const insertContent: InputHandler = (controller, event) => {
    const content = getContentFromInput(event, controller);
    if (content) {
        controller.insertContentOrPromise(content);
    }
};
