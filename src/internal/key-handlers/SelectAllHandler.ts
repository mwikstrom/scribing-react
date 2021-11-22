import { KeyHandler } from "./KeyHandler";

export const SelectAllHandler: KeyHandler = (e, state) => {
    // CTRL + A selects all content
    if (e.code === "KeyA" && e.ctrlKey && !e.shiftKey && !e.altKey) {
        state.selectAll();
        e.preventDefault();
    }
};
