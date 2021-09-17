import { TextStyle, TextStyleProps } from "scribing";
import { getSelectionFromInput } from "./get-selection-from-input";
import { InputHandler } from "./InputHandler";

/** @internal */
export const toggleTextStyle = (
    key: BooleanTextStyleKeys,
): InputHandler => (event, host, state) => {
    const { content, theme } = state;
    const selection = getSelectionFromInput(event, host);
    
    if (selection === null) {
        return null;
    }
    
    const current = selection.getUniformTextStyle(content, theme).get(key);
    const apply = TextStyle.empty.set(key, !current);

    return selection.formatText(apply);
};

type BooleanTextStyleKeys = {
    [K in keyof TextStyleProps]-?: boolean extends TextStyleProps[K] ? K : never
}[keyof TextStyleProps];
