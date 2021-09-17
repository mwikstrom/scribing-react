import React, { FC, useMemo } from "react";
import { DefaultFlowTheme, FlowContent, FlowNode, FlowTheme, ParagraphBreak } from "scribing";
import { FlowNodeComponentMap } from "./FlowNodeComponent";
import { FlowNodeKeyManager } from "./internal/FlowNodeKeyManager";
import { ParagraphView, ParagraphViewProps } from "./internal/ParagraphView";

/**
 * Component props for {@link FlowView}
 * @public
 */
export interface FlowViewProps {
    content: FlowContent;
    theme?: FlowTheme;
    map?: Partial<Readonly<FlowNodeComponentMap>>;
}

/**
 * Flow content view component
 * @public
 */
export const FlowView: FC<FlowViewProps> = props => {
    const { 
        content: { nodes },
        theme = DefaultFlowTheme.instance,
        map = {},
    } = props;
    const forwardProps = { theme, map };
    const keyManager = useMemo(() => new FlowNodeKeyManager(), []);
    const paragraphArray = useMemo(() => splitToParagraphs(nodes), [nodes, keyManager]);
    const keyRenderer = keyManager.createRenderer();
    const children = paragraphArray.map(paraProps => (
        <ParagraphView 
            key={paraProps.breakNode ? keyRenderer.getNodeKey(paraProps.breakNode) : "$trailing-para"}
            {...paraProps}
            {...forwardProps}
        />
    ));
    return <>{children}</>;
};

const splitToParagraphs = (source: readonly FlowNode[]): Pick<ParagraphViewProps, "breakNode" | "children">[] => {
    const result: Pick<ParagraphViewProps, "breakNode" | "children">[] = [];
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
