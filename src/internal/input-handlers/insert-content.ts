import { getContentFromInput } from "./get-content-from-input";
import { getSelectionFromInput } from "./get-selection-from-input";
import { InputHandler } from "./InputHandler";

/** @internal */
export const insertContent: InputHandler = (event, host, state) => {
    const { caret } = state;
    const content = getContentFromInput(event, caret);
    if (content === null) {
        return null;
    }

    const selection = getSelectionFromInput(event, host);
    return selection?.insert(content) ?? null;
};
