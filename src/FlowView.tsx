import React, { FC, useMemo } from "react";
import { DefaultFlowTheme, FlowContent, FlowNode, FlowTheme, ParagraphBreak, TextRun } from "scribing";
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
    components?: Partial<Readonly<FlowNodeComponentMap>>;
}

/**
 * Flow content view component
 * @public
 */
export const FlowView: FC<FlowViewProps> = props => {
    const { 
        content: { nodes },
        theme = DefaultFlowTheme.instance,
        components = {},
    } = props;
    const forwardProps = { components };
    const keyManager = useMemo(() => new FlowNodeKeyManager(), []);
    const paragraphArray = useMemo(() => splitToParagraphs(nodes, theme), [nodes, keyManager, theme]);
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

const splitToParagraphs = (
    source: readonly FlowNode[],
    theme: FlowTheme,
): Pick<ParagraphViewProps, "breakNode" | "children" | "theme">[] => {
    const result: Pick<ParagraphViewProps, "breakNode" | "children" | "theme">[] = [];
    let children: FlowNode[] = [];

    for (const node of source) {
        children.push(node);
        if (node instanceof ParagraphBreak) {
            result.push({
                children,
                breakNode: node,
                theme: theme.getParagraphTheme(node.style.variant ?? "normal"),
            });
            children = [];
        }
    }

    // Append a virtual text node in the trailing para
    if (children.length === 0) {
        children.push(TextRun.fromData(""));
    }

    result.push({
        children,
        breakNode: null,
        theme: theme.getParagraphTheme("normal"),
    });

    return result;
};
