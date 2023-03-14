import {
    EmptyMarkup,
    EndMarkup,
    FlowContent,
    FlowCursor,
    FlowRange,
    StartMarkup,
    TextRun
} from "scribing";
import { TextConversionHandler } from "./TextConversionHandler";

export const MarkupConversion: TextConversionHandler = {
    isTrigger: insertedText => insertedText === ">",
    applyTo: ({ content, position, theme, select }) => {
        let cursor = new FlowCursor(content).move(position);
        let delta = 0;
        
        if (!(cursor.node instanceof TextRun)) {
            cursor = cursor.move(-1);
            delta = 1;
        }
        
        const { node, offset } = cursor;

        if (node instanceof TextRun) {
            const text = node.text.substring(0, offset + delta);
            const focus = cursor.position - cursor.offset + text.length;
            const match = /<(\/)?([a-z]+) *(\/)?>$/i.exec(text);
            if (match) {
                const [fullMatch, closeMark, tagName, emptyMark] = match;
                const anchor = focus - fullMatch.length;
                const options = { target: content, theme };
                if (closeMark) {
                    const tag = EndMarkup.fromData({ end_markup: tagName });
                    return [select(new FlowRange({ anchor, focus }))?.insert(FlowContent.fromData([tag]), options)];
                } else if (emptyMark) {
                    const tag = EmptyMarkup.fromData({ empty_markup: tagName });
                    return [select(new FlowRange({ anchor, focus }))?.insert(FlowContent.fromData([tag]), options)];
                } else {
                    const startTag = StartMarkup.fromData({ start_markup: tagName });
                    const endTag = EndMarkup.fromData({ end_markup: tagName });
                    return [
                        select(new FlowRange({ anchor, focus }))?.insert(FlowContent.fromData([endTag]), options),
                        select(FlowRange.at(anchor))?.insert(FlowContent.fromData([startTag]), options),
                        select(FlowRange.at(anchor + 1)),
                    ];
                }
            }
        }
    },
};
