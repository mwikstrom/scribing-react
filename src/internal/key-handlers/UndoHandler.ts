import { KeyHandler } from "./KeyHandler";

export const UndoHandler: KeyHandler = (e, state) => {
    // CTRL + Z undoes last operation
    if ((e.code === "KeyZ" && e.ctrlKey && !e.shiftKey && !e.altKey) || e.key === "Undo") {
        return state.undo();
    }
};
