import { KeyHandler } from "./KeyHandler";

export const TabHandler: KeyHandler = (e, commands) => {
    // Tab is used to increase/decreate list level
    if (e.key === "Tab") {
        e.preventDefault();
        if (!e.ctrlKey && !e.altKey) {
            if (e.shiftKey) {
                commands.decrementListLevel();
            } else {
                commands.incrementListLevel();
            }
        }
    }
};
