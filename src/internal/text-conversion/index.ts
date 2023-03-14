import { FlowBatch, FlowOperation, FlowRange, FlowSelection } from "scribing";
import { FlowEditorController } from "../../FlowEditorController";
import { MarkupConversion } from "./MarkupConversion";
import { TextConversionHandler } from "./TextConversionHandler";

const ALL_HANDLERS: TextConversionHandler[] = [
    MarkupConversion,
];

export const applyTextConversion = (controller: FlowEditorController, insertedText: string): boolean => {
    for (const handler of ALL_HANDLERS) {
        if (handler.isTrigger(insertedText)) {
            const { state: before } = controller;
            const { content, selection, theme } = before;
            if (selection) {
                const { state: before } = controller;
                const changes: FlowOperation[] = [];
                let newSelection: FlowSelection | undefined;
                selection.visitRanges((range, { target, wrap: select }) => {
                    if (target && range instanceof FlowRange && range.isCollapsed) {
                        const { focus: position } = range;
                        const result = handler.applyTo({
                            content: target,
                            position,
                            theme,
                            select,
                        });
                        if (result) {
                            for (const entry of result) {
                                if (entry instanceof FlowOperation) {
                                    changes.push(entry);
                                } else if (entry instanceof FlowSelection) {
                                    newSelection = entry;
                                }
                            }
                        }
                    }
                }, { target: content, theme });
                if (changes.length > 0) {
                    controller._apply(FlowBatch.fromArray(changes));
                }
                if (newSelection) {
                    controller.setSelection(newSelection);
                }
                return !controller.state.equals(before);
            }
        }
    }
    return false;
};
