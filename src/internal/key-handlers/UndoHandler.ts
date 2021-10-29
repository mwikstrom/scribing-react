import { KeyHandler } from "./KeyHandler";

export const UndoHandler: KeyHandler = (e, commands) => {
    // CTRL + Z undoes last operation
    if ((e.code === "KeyZ" && e.ctrlKey && !e.shiftKey && !e.altKey) || e.key === "Undo") {
        e.preventDefault();
        commands.undo();
    }
};
