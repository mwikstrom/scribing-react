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
        const match = TRIGGER_PATTERN.exec(text);
        if (match) {
            const [fullMatch, closeMark, tagName, unparsedAttrs, emptyMark] = match;
            const anchor = focus - fullMatch.length;
            const attr = parseAttributes(unparsedAttrs);

            if (!closeMark && !emptyMark) {
                const startTag = StartMarkup.fromData({ start_markup: tagName, attr });
                const endTag = EndMarkup.fromData({ end_markup: tagName });
                return [
                    select(new FlowRange({ anchor, focus }))?.insert(FlowContent.fromData([endTag]), target),
                    select(FlowRange.at(anchor))?.insert(FlowContent.fromData([startTag]), target),
                    select(FlowRange.at(anchor + 1)),
                ];
            } else if (!closeMark && emptyMark) {
                const tag = EmptyMarkup.fromData({ empty_markup: tagName, attr });
                return [select(new FlowRange({ anchor, focus }))?.insert(FlowContent.fromData([tag]), target)];
            } else if (closeMark && !unparsedAttrs) {
                const tag = EndMarkup.fromData({ end_markup: tagName });
                return [select(new FlowRange({ anchor, focus }))?.insert(FlowContent.fromData([tag]), target)];
            }
        }
    },
};

const parseAttributes = (input: string | undefined): Readonly<Map<string, string>> | undefined => {
    const result = new Map<string, string>();
    if (input) {
        for (let match = ATTR_PATTERN.exec(input); match; match = ATTR_PATTERN.exec(input)) {
            const [, name, value] = match;
            result.set(name, value);
        }
    }
    if (result.size > 0) {
        return result;
    }
};

const TRIGGER_PATTERN = /<(\/)?([a-z]+)((?: +[a-z]+ *= *"[^"]*")*)? *(\/)?>$/i;
const ATTR_PATTERN = /\s*([^=\s]+)\s*=\s*"([^"]*)"\s*/g;