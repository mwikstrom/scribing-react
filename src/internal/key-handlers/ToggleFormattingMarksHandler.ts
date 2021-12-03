import { KeyHandler } from "./KeyHandler";

export const ToggleFormattingMarksHandler: KeyHandler = (e, controller) => {
    // CTRL + SHIFT + 8 toggles formatting marks (just like in Word)
    if (e.code === "Digit8" && e.ctrlKey && e.shiftKey && !e.altKey) {
        e.preventDefault();
        controller.toggleFormattingMarks();
    }
};
