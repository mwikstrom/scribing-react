import { getContentFromInput } from "./get-content-from-input";
import { getSelectionFromInput } from "./get-selection-from-input";
import { InputHandler } from "./InputHandler";

/** @internal */
export const insertContent: InputHandler = (event, host) => {
    const content = getContentFromInput(event);
    if (content === null) {
        return null;
    }

    const selection = getSelectionFromInput(event, host);
    return selection?.insert(content) ?? null;
};
