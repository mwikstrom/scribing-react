import { KeyHandler } from "./KeyHandler";

export const BackspaceHandler: KeyHandler = (e, commands) => {
    // Explicitly handle backspace when selection is collapsed because the default handling
    // does not work properly when caret is placed just after a one-sized (nesting) node.
    if (e.key === "Backspace" && commands.isCaret()) {
        e.preventDefault();
        commands.removeBackward();
    }
};
