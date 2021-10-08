import { KeyHandler } from "./KeyHandler";

export const TabHandler: KeyHandler = (e, state) => {
    // Tab is used to increase/decreate list level
    if (e.key === "Tab") {
        if (state.selection && !e.ctrlKey && !e.altKey) {
            const delta = e.shiftKey ? -1 : 1;
            const operation = state.selection.incrementListLevel(state.content, delta);
            return operation;
        }
        
        return null;
    }
};
