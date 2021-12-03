import { KeyHandler } from "./KeyHandler";

export const TabHandler: KeyHandler = (e, controller) => {
    // Tab is used to increase/decreate list level
    if (e.key === "Tab") {
        e.preventDefault();
        if (!e.ctrlKey && !e.altKey) {
            if (e.shiftKey) {
                controller.decrementListLevel();
            } else {
                controller.incrementListLevel();
            }
        }
    }
};
