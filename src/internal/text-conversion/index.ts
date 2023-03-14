import { FlowOperation, FlowRange, FlowSelection } from "scribing";
import { FlowEditorState } from "../../FlowEditorState";
import { MarkupConversion } from "./MarkupConversion";
import { TextConversion } from "./TextConversion";

const ALL_HANDLERS: TextConversion[] = [
    MarkupConversion,
];

export const isTextConversionTrigger = (event: KeyboardEvent): boolean => {
    for (const handler of ALL_HANDLERS) {
        if (handler.isTrigger(event)) {
            return true;
        }
    }
    return false;
};

export interface TextConversionOptions {
    readonly state: FlowEditorState;
    readonly trigger: FlowSelection;
    applyChange(change: FlowOperation | FlowEditorState, base: FlowEditorState): FlowEditorState;
}

export const applyTextConversion = (options: TextConversionOptions): FlowEditorState | undefined => {
    const { state, trigger, applyChange } = options;
    let result: [FlowOperation | null, FlowSelection | null] | undefined;
    
    trigger.visitRanges((range, options) => {
        if (!result) {
            const { target: content, theme, wrap: select } = options;
            if (range instanceof FlowRange && range.isCollapsed && content) {
                const { focus: position } = range;
                for (const handler of ALL_HANDLERS) {
                    if (!result) {
                        result = handler.applyTo({ content, position, theme, select });
                    }
                }
            }
        }
    }, { target: state.content, theme: state.theme });

    if (result) {
        const [change, newSelection] = result;
        if (change) {
            let nextState = applyChange(change, state);
            if (nextState && newSelection) {
                nextState = applyChange(nextState.set("selection", newSelection), nextState);
            }
            return nextState;
        }
    }
};
