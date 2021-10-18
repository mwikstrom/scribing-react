import { RemoveFlowSelectionOptions } from "scribing";
import { KeyHandler } from "./KeyHandler";

export const BackspaceHandler: KeyHandler = (e, state) => {
    // Explicitly handle backspace when selection is collapsed because the default handling
    // does not work properly when caret is placed just after a one-sized (nesting) node.
    const { selection } = state;
    if (e.key === "Backspace" && selection && selection.isCollapsed) {
        const options: RemoveFlowSelectionOptions = {
            target: state.content,
            theme: state.theme,
            whenCollapsed: "removeBackward",
        };
        return selection.remove(options);
    }
};
