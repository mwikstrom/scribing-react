import React from "react";
import { Script } from "scribing";
import { MarkupAttributeValue } from "./MarkupAttributeValue";
import { useMarkupStyles } from "./MarkupStyles";
import { ScriptEvalScope } from "./hooks/use-script-eval-props";

export interface MarkupTagContentProps {
    tag: string;
    attr: [string, string | Script][];
    evalScope: ScriptEvalScope;
}

export const MarkupTagContent = (props: MarkupTagContentProps): JSX.Element => {
    const { tag, attr, evalScope } = props;
    const classes = useMarkupStyles();
    return (
        <>
            {tag}
            {attr.map(([key, value]) => (
                <span key={key}>
                    {` ${key}`}
                    <span className={classes.syntax}>=</span>
                    <MarkupAttributeValue tag={tag} name={key} value={value} evalScope={evalScope}/>
                </span>
            ))}
        </>
    );
};
