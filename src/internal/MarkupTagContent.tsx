import React, { useCallback, useMemo } from "react";
import { Script } from "scribing";
import { MarkupAttributeValue } from "./MarkupAttributeValue";
import { useMarkupStyles } from "./MarkupStyles";
import { ScriptEvalScope } from "./hooks/use-script-eval-props";
import { useMarkupTagRenderHandler } from "./MarkupTagRenderScope";
import { RenderMarkupTagEvent } from "../RenderMarkupTagEvent";
import { registerBreakOutNode } from "./utils/break-out";

export interface MarkupTagContentProps {
    tag: string;
    attr: ReadonlyMap<string, string | Script> | null;
    evalScope: ScriptEvalScope;
    onChangeAttr(this: void, key: string, value: string | Script | null): boolean;
    onMakeBlock(this: void): void;
}

export const MarkupTagContent = (props: MarkupTagContentProps): JSX.Element => {
    const { tag, attr, onChangeAttr, onMakeBlock } = props;
    const handler = useMarkupTagRenderHandler();

    const { content: customContent, block } = useMemo(() => {
        if (attr) {
            const event = new RenderMarkupTagEvent(tag, attr, onChangeAttr);
            handler(event);
            if (event.block) {
                onMakeBlock();
            }
            return event;
        } else {
            return { content: undefined, block: false };
        }
    }, [handler, tag, attr, onChangeAttr, onMakeBlock]);

    const stopPropagation = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
    }, []);

    if (!customContent) {
        return <DefaultContent {...props} />;
    }

    const Component = block ? "div" : "span";
    return (
        <Component
            ref={registerBreakOutNode}
            onClick={stopPropagation}
            onDoubleClick={stopPropagation}
            children={customContent}
        />
    );
};

const DefaultContent = (props: MarkupTagContentProps): JSX.Element => {
    const { tag, attr, evalScope } = props;
    const classes = useMarkupStyles();
    return (
        <>
            {tag}
            {attr && Array.from(attr).map(([key, value]) => (
                <span key={key}>
                    {` ${key}`}
                    <span className={classes.syntax}>=</span>
                    <MarkupAttributeValue tag={tag} name={key} value={value} evalScope={evalScope}/>
                </span>
            ))}
        </>
    );
};
