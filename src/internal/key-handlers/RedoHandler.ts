import { KeyHandler } from "./KeyHandler";

export const RedoHandler: KeyHandler = (e, state) => {
    // CTRL + Y redoes last undone operation
    if (e.code === "KeyY" && e.ctrlKey && !e.shiftKey && !e.altKey) {
        return state.redo();
    }
};
