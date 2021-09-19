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

    let style = selection.getUniformTextStyle(content, theme);
    if (selection.isCollapsed) {
        style = style.merge(state.caret);
    }

    const current = style.get(key);
    const apply = TextStyle.empty.set(key, !current);

    if (selection.isCollapsed) {
        return state.set("caret", state.caret.merge(apply));
    } else {
        return selection.formatText(apply);
    }
};

type BooleanTextStyleKeys = {
    [K in keyof TextStyleProps]-?: boolean extends TextStyleProps[K] ? K : never
}[keyof TextStyleProps];
