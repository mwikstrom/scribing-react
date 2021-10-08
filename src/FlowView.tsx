import React, { FC, useMemo } from "react";
import { FlowContent, FlowNode, FlowTheme, ParagraphBreak, ParagraphTheme, TextRun } from "scribing";
import { useFlowTheme } from "./FlowThemeScope";
import { FlowNodeKeyManager } from "./internal/FlowNodeKeyManager";
import { ParagraphView, ParagraphViewProps } from "./internal/ParagraphView";
import { ParagraphThemeScope } from "./ParagraphThemeScope";

/**
 * Component props for {@link FlowView}
 * @public
 */
export interface FlowViewProps {
    content: FlowContent;
}

/**
 * Flow content view component
 * @public
 */
export const FlowView: FC<FlowViewProps> = props => {
    const { content: { nodes } } = props;
    const keyManager = useMemo(() => new FlowNodeKeyManager(), []);
    const theme = useFlowTheme();
    const paragraphArray = useMemo(() => splitToParagraphs(nodes, theme), [nodes, keyManager, theme]);
    const keyRenderer = keyManager.createRenderer();
    const children = paragraphArray.map(({ theme: paraTheme, ...paraProps}) => (
        <ParagraphThemeScope 
            key={paraProps.breakNode ? keyRenderer.getNodeKey(paraProps.breakNode) : "$trailing-para"}
            theme={paraTheme}
            children={<ParagraphView {...paraProps}/>}
        />
    ));
    return <>{children}</>;
};

interface SplitParaProps extends Pick<ParagraphViewProps, "breakNode" | "children" | "prevBreak"> {
    theme: ParagraphTheme;
}

const splitToParagraphs = (
    source: readonly FlowNode[],
    theme: FlowTheme,
): SplitParaProps[] => {
    const result: SplitParaProps[] = [];
    let prevBreak: ParagraphBreak | null = null;
    let children: FlowNode[] = [];

    for (const node of source) {
        children.push(node);
        if (node instanceof ParagraphBreak) {
            result.push({
                children,
                breakNode: node,
                prevBreak,
                theme: theme.getParagraphTheme(node.style.variant ?? "normal"),
            });
            prevBreak = node;
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
        prevBreak,
        theme: theme.getParagraphTheme("normal"),
    });

    return result;
};
