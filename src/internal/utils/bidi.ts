import { FlowEditorState, ParagraphStyle } from "scribing";

export function getForwardArrowKey(state: FlowEditorState): "ArrowLeft" | "ArrowRight" {
    return isReversedReadingDirection(state) ? "ArrowLeft" : "ArrowRight";
}

export function getBackArrowKey(state: FlowEditorState): "ArrowLeft" | "ArrowRight" {
    return isReversedReadingDirection(state) ? "ArrowRight" : "ArrowLeft";
}

export function isReversedReadingDirection(state: FlowEditorState): boolean {
    return getReadingDirection(state) === "rtl";
}

export function getReadingDirection(state: FlowEditorState): "ltr" | "rtl" {
    let style = PARA_STYLE_CACHE.get(state);

    if (style === void(0)) {
        if (state.selection === null) {
            style = ParagraphStyle.empty;
        } else {
            style = state.selection.getUniformParagraphStyle(state.content, state.theme);
        }

        PARA_STYLE_CACHE.set(state, style);
    }

    return style.direction ?? "ltr";
}

const PARA_STYLE_CACHE = new WeakMap<FlowEditorState, ParagraphStyle>();