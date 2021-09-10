import React, { FC } from "react";
import { FlowContent, FlowNode, ParagraphStyle } from "scribing";
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
    const paraArray = splitToParagraphs(nodes);
    return <>{paraArray.map(para => <ParagraphView {...para}/>)}</>;
};

interface Paragraph extends ParagraphViewProps {
    key: string;
}

const splitToParagraphs = (source: readonly FlowNode[]): Paragraph[] => {
    const result: Paragraph[] = [];
    let nodes: FlowNode[] = [];

    for (const node of source) {
        nodes.push(node);
        const style = node.getParagraphStyle();
        if (style !== null) {
            const { transientKey: key } = node;
            result.push({ nodes, style, key });
            nodes = [];
        }
    }

    if (nodes.length > 0) {
        const style = ParagraphStyle.empty;
        const key = "$trailing-para";
        result.push({ nodes, style, key });
    }

    return result;
};
