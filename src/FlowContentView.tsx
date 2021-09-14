import React, { FC, useMemo } from "react";
import { FlowContent, FlowNode, ParagraphBreak } from "scribing";
import { ParagraphView, ParagraphViewProps } from "./internal/ParagraphView";

/**
 * Component props for {@link FlowContentView}
 * @public
 */
export interface FlowContentViewProps {
    content: FlowContent;
}

/**
 * Flow content view component
 * @public
 */
export const FlowContentView: FC<FlowContentViewProps> = props => {
    const { content: { nodes } } = props;
    const paragraphArray = useMemo(() => splitToParagraphs(nodes), [nodes]);
    return <>{paragraphArray.map(para => <ParagraphView {...para}/>)}</>;
};

interface Paragraph extends ParagraphViewProps {
    key: string;
}

const splitToParagraphs = (source: readonly FlowNode[]): Paragraph[] => {
    const result: Paragraph[] = [];
    let children: FlowNode[] = [];

    for (const node of source) {
        children.push(node);
        if (node instanceof ParagraphBreak) {
            const { transientKey: key } = node;
            result.push({ key, children, breakNode: node });
            children = [];
        }
    }

    if (children.length > 0) {
        const key = "$trailing-para";
        result.push({ key, children, breakNode: null });
    }

    return result;
};
