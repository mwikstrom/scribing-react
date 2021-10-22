import React, { FC, useMemo } from "react";
import { FlowNode, FlowTheme, ParagraphBreak, ParagraphTheme, TextRun } from "scribing";
import { useFlowTheme } from "./FlowThemeScope";
import { FlowNodeKeyManager } from "./FlowNodeKeyManager";
import { ParagraphView, ParagraphViewProps } from "./ParagraphView";
import { ParagraphThemeScope } from "./ParagraphThemeScope";

/**
 * Component props for {@link FlowFragmentView}
 * @internal
 */
export interface FlowFragmentViewProps {
    nodes: readonly FlowNode[];
    prevBreak?: ParagraphBreak | null;
}

/**
 * Flow fragment view component
 * @internal
 */
export const FlowFragmentView: FC<FlowFragmentViewProps> = props => {
    const { nodes, prevBreak = null } = props;
    const keyManager = useMemo(() => new FlowNodeKeyManager(), []);
    const theme = useFlowTheme();
    const paragraphArray = useMemo(
        () => splitToParagraphs(nodes, theme, prevBreak),
        [nodes, keyManager, theme, prevBreak]
    );
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
    prevBreak: ParagraphBreak | null,
): SplitParaProps[] => {
    const result: SplitParaProps[] = [];
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
