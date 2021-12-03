import { KeyHandler } from "./KeyHandler";

export const BaselineHandler: KeyHandler = (e, controller) => {
    // CTRL + UP/DOWN: Change baseline offset
    if (e.key === "ArrowUp" && e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        controller.increaseBaselineOffset();
    } else if (e.key === "ArrowDown" && e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        controller.decreaseBaselineOffset();
    }
};
