import { FlowEditorState, TargetOptions, TextStyle } from "scribing";
import { KeyHandler } from "./KeyHandler";

export const BaselineHandler: KeyHandler = (e, state) => {
    // CTRL + UP/DOWN: Change baseline offset
    if (e.key === "ArrowUp" && e.ctrlKey && !e.shiftKey) {
        return increaseBaselineOffset(state);
    } else if (e.key === "ArrowDown" && e.ctrlKey && !e.shiftKey) {
        return decreaseBaselineOffset(state);
    }
};

const increaseBaselineOffset = (state: FlowEditorState) => {
    const baseline = getBaselineOffset(state);
    console.log("current", baseline);
    if (baseline === "normal") {
        return setBaselineOffset(state, "super");
    } else if (baseline === "sub") {
        return setBaselineOffset(state, "normal");
    } else {
        return null;
    }
};

const decreaseBaselineOffset = (state: FlowEditorState) => {
    const baseline = getBaselineOffset(state);
    if (baseline === "normal") {
        return setBaselineOffset(state, "sub");
    } else if (baseline === "super") {
        return setBaselineOffset(state, "normal");
    } else {
        return null;
    }
};

const getBaselineOffset = (state: FlowEditorState) => {
    const { caret, selection } = state;
    if (!selection || selection.isCollapsed) {
        return caret.baseline ?? state.getUniformTextStyle().baseline;
    } else {
        return state.getUniformTextStyle().baseline;
    }
};

const setBaselineOffset = (state: FlowEditorState, value: "sub" | "super" | "normal") => {
    const { selection } = state;
    const style = TextStyle.empty.set("baseline", value);
    if (!selection || selection.isCollapsed) {
        const { caret } = state;
        return state.set("caret", caret.merge(style));
    } else {
        const { content: target, theme } = state;
        const options: TargetOptions = { target, theme };
        return selection.formatText(style, options);
    }
};
