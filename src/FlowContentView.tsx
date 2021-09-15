import React, { FC, useMemo } from "react";
import { FlowContent, FlowNode, ParagraphBreak } from "scribing";
import { FlowNodeKeyManager } from "./internal/FlowNodeKeyManager";
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
    const keyManager = useMemo(() => new FlowNodeKeyManager(), []);
    const paragraphArray = useMemo(() => splitToParagraphs(nodes), [nodes, keyManager]);
    const keyRenderer = keyManager.createRenderer();
    const children = paragraphArray.map(paraProps => (
        <ParagraphView 
            key={paraProps.breakNode ? keyRenderer.getNodeKey(paraProps.breakNode) : "$trailing-para"}
            {...paraProps}
        />
    ));
    return <>{children}</>;
};

const splitToParagraphs = (source: readonly FlowNode[]): ParagraphViewProps[] => {
    const result: ParagraphViewProps[] = [];
    let children: FlowNode[] = [];

    for (const node of source) {
        children.push(node);
        if (node instanceof ParagraphBreak) {
            result.push({ children, breakNode: node });
            children = [];
        }
    }

    if (children.length > 0) {
        result.push({ children, breakNode: null });
    }

    return result;
};
