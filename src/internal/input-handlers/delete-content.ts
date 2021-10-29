import { InputHandler } from "./InputHandler";

/** @internal */
export const deleteContent: InputHandler = commands => {
    commands.remove();
};

/** @internal */
export const deleteContentBackward: InputHandler = commands => {
    commands.removeBackward();
};

/** @internal */
export const deleteContentForward: InputHandler = commands => {
    commands.removeForward();
};
