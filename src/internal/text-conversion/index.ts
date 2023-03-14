import { FlowBatch, FlowCursor, FlowOperation, FlowRange, FlowSelection, TextRun } from "scribing";
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
            const { selection } = before;
            if (selection) {
                const { state: before } = controller;
                const changes: FlowOperation[] = [];
                let newSelection: FlowSelection | undefined;
                selection.visitRanges((range, { target, theme, wrap: select }) => {
                    if (target && range instanceof FlowRange && range.isCollapsed) {
                        let cursor = new FlowCursor(target).move(range.focus);
                        let delta = 0;
                        
                        if (!(cursor.node instanceof TextRun)) {
                            cursor = cursor.move(-1);
                            delta = 1;
                        }
                        
                        const { node, offset } = cursor;
                
                        if (node instanceof TextRun) {
                            const text = node.text.substring(0, offset + delta);
                            const position = cursor.position - cursor.offset + text.length;
                            const result = handler.applyTo({
                                text,
                                position,
                                target: { target, theme },
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
                    }
                }, { target: before.content, theme: before.theme });
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
