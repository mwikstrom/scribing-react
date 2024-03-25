import { FlowRange, FlowSelection } from "scribing";
import { KeyHandler } from "./KeyHandler";
import { FlowEditorController } from "../../FlowEditorController";

// This handler exists to fix a bug that prevent tables and empty boxes from being
// selected by placing the caret just before/after the table or box, holding down
// shift and pressing left/right arrow.
//
// The handler itself doesn't really care about whether there's a table or box to 
// selected, it just captures the case when SHIFT+LEFT/RIGHT is pressed and there
// is a flow position to be selected, extending the selection focus point.
export const LeftRightSelectionHandler: KeyHandler = (e, controller) => {
    if (e.shiftKey && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        const newSelection = getNewSelection(controller, e.key === "ArrowLeft" ? -1 : 1);
        if (newSelection) {
            e.preventDefault();
            controller.setSelection(newSelection);
        }
    }
};

const getNewSelection = (controller: FlowEditorController, distance: -1 | 1): FlowSelection | null => {
    let result: FlowSelection | null = null;
    controller.getSelection()?.visitRanges((range, { wrap, target }) => {
        if (range instanceof FlowRange && target) {
            const newFocus = range.focus + distance;
            if (newFocus >= 0 && newFocus < target.size) {
                result = wrap(range.set("focus", newFocus));
            }
        }
    }, controller.getTargetOptions());
    return result;
};
