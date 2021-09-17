import { TextStyleProps } from "scribing";
import { getSelectionFromInput } from "./get-selection-from-input";
import { InputHandler } from "./InputHandler";

/** @internal */
export const toggleTextStyle = (key: keyof TextStyleProps): InputHandler => (event, host, state) => {
    const { content, theme } = state;
    const selection = getSelectionFromInput(event, host);
    if (selection === null) {
        return null;
    }
    // TODO: IMPLEMENT
    // const effective = selection.getEffectiveTextStyle(content, theme);
    return null;
};
