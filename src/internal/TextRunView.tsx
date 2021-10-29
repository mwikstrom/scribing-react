import React, { ReactNode, useEffect, useMemo, useState } from "react";
import { FlowRangeSelection, TextRun } from "scribing";
import { flowNode } from "./FlowNodeComponent";
import { TextSegment } from "./TextSegment";
import { FlowCaret } from "./FlowCaret";

export const TextRunView = flowNode<TextRun>((props, ref) => {
    const { node, selection } = props;
    const { text, style } = node;

    // Enable spell checker only after text and selection has been idle for a while
    const [spellCheck, setSpellCheck] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => setSpellCheck(true), 500);
        setSpellCheck(false);
        return () => clearTimeout(timeout);
    }, [text, selection]);

    const children = useMemo<ReactNode>(() => {
        if (selection instanceof FlowRangeSelection) {
            const { range } = selection;
            if (range.isCollapsed) {
                const { first: caret } = range;
                return (
                    <>
                        {caret > 0 && <TextSegment style={style} text={text.substr(0, caret)}/> }
                        <FlowCaret style={style}/>
                        {caret < text.length && <TextSegment style={style} text={text.substr(caret)}/> }
                    </>
                );
            } else {
                const { first, last } = range;
                return (
                    <>
                        {first > 0 && <TextSegment style={style} text={text.substr(0, first)}/> }
                        <TextSegment style={style} text={text.substr(first, last - first)} selected/>
                        {last < text.length && <TextSegment style={style} text={text.substr(last)}/> }
                    </>
                );
            }
        } else {
            return <TextSegment style={style} text={text} selected={selection === true}/>;
        }
    }, [text, selection]);

    return (
        <span
            ref={ref}
            spellCheck={spellCheck}
            children={children}
        />
    );
});
