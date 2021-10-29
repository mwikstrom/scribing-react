import React, { FC, useMemo } from "react";
import { FlowNode, FlowSelection, FlowTheme, ParagraphBreak, ParagraphTheme, TextRun } from "scribing";
import { useFlowTheme } from "./FlowThemeScope";
import { FlowNodeKeyManager } from "./FlowNodeKeyManager";
import { ParagraphView, ParagraphViewProps } from "./ParagraphView";
import { ParagraphThemeScope } from "./ParagraphThemeScope";
import { getFlowFragmentSelection } from "./utils/get-sub-selection";
import { EmptyFlowFragment } from "./EmptyFlowFragment";

/**
 * Component props for {@link FlowFragmentView}
 * @internal
 */
export interface FlowFragmentViewProps {
    nodes: readonly FlowNode[];
    selection: FlowSelection | boolean;
    prevBreak?: ParagraphBreak | null;
    emptyTrailingPara?: boolean;
}

/**
 * Flow fragment view component
 * @internal
 */
export const FlowFragmentView: FC<FlowFragmentViewProps> = props => {
    const { nodes, prevBreak = null, emptyTrailingPara = false, selection } = props;
    const keyManager = useMemo(() => new FlowNodeKeyManager(), []);
    const theme = useFlowTheme();
    const paragraphArray = useMemo(
        () => splitToParagraphs(nodes, theme, prevBreak, emptyTrailingPara, selection),
        [nodes, keyManager, theme, prevBreak, emptyTrailingPara, selection]
    );
    const keyRenderer = keyManager.createRenderer();
    const children = paragraphArray.length === 0 ? (
        <EmptyFlowFragment selection={selection}/>
    ) : paragraphArray.map(({ theme: paraTheme, ...paraProps}) => (
        <ParagraphThemeScope 
            key={paraProps.breakNode ? keyRenderer.getNodeKey(paraProps.breakNode) : "$trailing-para"}
            theme={paraTheme}
            children={<ParagraphView {...paraProps}/>}
        />
    ));
    return <>{children}</>;
};

interface SplitParaProps extends Pick<ParagraphViewProps, "breakNode" | "children" | "prevBreak" | "selection"> {
    theme: ParagraphTheme;
}

const splitToParagraphs = (
    source: readonly FlowNode[],
    theme: FlowTheme,
    prevBreak: ParagraphBreak | null,
    emptyTrailingPara: boolean,
    outerSelection: FlowSelection | boolean,
): SplitParaProps[] => {
    const result: SplitParaProps[] = [];
    let children: FlowNode[] = [];
    let index = 0;
    let position = 0;
    let startIndex = 0;
    let startPosition = 0;

    for (const node of source) {
        children.push(node);
        ++index;
        position += node.size;

        if (node instanceof ParagraphBreak) {
            result.push({
                children,
                breakNode: node,
                prevBreak,
                theme: theme.getParagraphTheme(node.style.variant ?? "normal"),
                selection: getFlowFragmentSelection(
                    outerSelection,
                    source,
                    startIndex,
                    index - startIndex,
                    startPosition,
                    position - startPosition,                    
                ),
            });
            prevBreak = node;
            children = [];
            startIndex = index;
            startPosition = position;
        }        
    }

    // Append a virtual text node in the trailing para?
    if (children.length === 0 && emptyTrailingPara) {
        children.push(TextRun.fromData(""));
    }

    if (children.length > 0) {
        result.push({
            children,
            breakNode: null,
            prevBreak,
            theme: theme.getParagraphTheme("normal"),
            selection: getFlowFragmentSelection(
                outerSelection,
                source,
                startIndex,
                index - startIndex,
                startPosition,
                position - startPosition,
            ),
        });
    }

    return result;
};
