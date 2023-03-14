import {
    EmptyMarkup,
    EndMarkup,
    FlowContent,
    FlowRange,
    StartMarkup,
} from "scribing";
import { TextConversionHandler } from "./TextConversionHandler";

export const MarkupConversion: TextConversionHandler = {
    isTrigger: insertedText => insertedText === ">",
    applyTo: ({ text, position: focus, target, select }) => {
        const match = /<(\/)?([a-z]+) *(\/)?>$/i.exec(text);
        if (match) {
            const [fullMatch, closeMark, tagName, emptyMark] = match;
            const anchor = focus - fullMatch.length;
            if (closeMark) {
                const tag = EndMarkup.fromData({ end_markup: tagName });
                return [select(new FlowRange({ anchor, focus }))?.insert(FlowContent.fromData([tag]), target)];
            } else if (emptyMark) {
                const tag = EmptyMarkup.fromData({ empty_markup: tagName });
                return [select(new FlowRange({ anchor, focus }))?.insert(FlowContent.fromData([tag]), target)];
            } else {
                const startTag = StartMarkup.fromData({ start_markup: tagName });
                const endTag = EndMarkup.fromData({ end_markup: tagName });
                return [
                    select(new FlowRange({ anchor, focus }))?.insert(FlowContent.fromData([endTag]), target),
                    select(FlowRange.at(anchor))?.insert(FlowContent.fromData([startTag]), target),
                    select(FlowRange.at(anchor + 1)),
                ];
            }
        }
    },
};
