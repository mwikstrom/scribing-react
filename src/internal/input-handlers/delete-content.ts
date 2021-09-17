import { getSelectionFromInput } from "./get-selection-from-input";
import { InputHandler } from "./InputHandler";

/** @internal */
export const deleteContent: InputHandler = (event, host) => {
    const selection = getSelectionFromInput(event, host);
    return selection?.remove() ?? null;
};
