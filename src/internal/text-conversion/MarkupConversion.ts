import {
    EmptyMarkup,
    EndMarkup,
    FlowContent,
    FlowCursor,
    FlowRange,
    ParagraphBreak,
    StartMarkup,
    TextRun
} from "scribing";
import { TextConversion } from "./TextConversion";

export const MarkupConversion: TextConversion = {
    isTrigger: ({ key }) => key === ">",
    applyTo: ({ content, position, theme, select }) => {
        let cursor = new FlowCursor(content).move(position);
        if (cursor.node instanceof ParagraphBreak) {
            cursor = cursor.move(-1);
        }
        const { node, offset } = cursor;
        if (node instanceof TextRun) {
            const text = node.text.substring(0, offset + 1);
            const focus = cursor.position - cursor.offset + text.length;
            const match = /<(\/)?([a-z]+) *(\/)?>$/i.exec(text);
            if (match) {
                const [fullMatch, closeMark, tagName, emptyMark] = match;
                let newContent: FlowContent;
                const anchor = focus - fullMatch.length;
                const oldSelection = select(new FlowRange({ anchor, focus }));

                if (closeMark) {
                    newContent = FlowContent.fromData([
                        EndMarkup.fromData({ end_markup: tagName })
                    ]);
                } else if (emptyMark) {
                    newContent = FlowContent.fromData([
                        EmptyMarkup.fromData({ empty_markup: tagName })
                    ]);
                } else {
                    newContent = FlowContent.fromData([
                        StartMarkup.fromData({ start_markup: tagName }),
                        EndMarkup.fromData({ end_markup: tagName })
                    ]);
                }
                
                if (oldSelection) {
                    const change = oldSelection.insert(newContent, { target: content, theme });
                    const newSelection = select(FlowRange.at(anchor + 1));
                    return [change, newSelection];
                }
            }
        }
    },
};
