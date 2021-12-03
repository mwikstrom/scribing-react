import { InputHandler } from "./InputHandler";

/** @internal */
export const deleteContent: InputHandler = controller => {
    controller.remove();
};

/** @internal */
export const deleteContentBackward: InputHandler = controller => {
    controller.removeBackward();
};

/** @internal */
export const deleteContentForward: InputHandler = controller => {
    controller.removeForward();
};
