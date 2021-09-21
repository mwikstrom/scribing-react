import { RemoveFlowSelectionOptions } from "scribing";
import { getSelectionFromInput } from "./get-selection-from-input";
import { InputHandler } from "./InputHandler";

/** @internal */
export const deleteContent: InputHandler = (event, host, state) => {
    const { inputType } = event;
    const { content: target } = state;
    const selection = getSelectionFromInput(event, host);
    const options: RemoveFlowSelectionOptions = {
        target,
        whenCollapsed: (
            inputType === "deleteContentBackward" ? "removeBackward" :
                inputType === "deleteContentForward" ? "removeForward" : "noop"
        ),
    };
    return selection?.remove(options) ?? null;
};
