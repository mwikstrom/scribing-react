import React, { FC, useMemo } from "react";
import { 
    EndMarkup,
    FlowContent,
    FlowCursor,
    FlowNode,
    FlowSelection,
    FlowTheme,
    ParagraphBreak,
    ParagraphTheme,
    StartMarkup,
} from "scribing";
import { useFlowTheme } from "./FlowThemeScope";
import { FlowNodeKeyManager } from "./FlowNodeKeyManager";
import { ParagraphView, ParagraphViewProps } from "./ParagraphView";
import { ParagraphThemeScope } from "./ParagraphThemeScope";
import { getFlowFragmentSelection } from "./utils/get-sub-selection";
import { EmptyFlowContent } from "./EmptyFlowContent";
import { OpposingTag } from "./FlowNodeComponent";

/**
 * Component props for {@link FlowContentView}
 * @internal
 */
export interface FlowContentViewProps {
    content: FlowContent;
    selection: FlowSelection | boolean;
    prevBreak?: ParagraphBreak | null;
}

/**
 * Flow content view component
 * @internal
 */
export const FlowContentView: FC<FlowContentViewProps> = props => {
    const { content, prevBreak = null, selection } = props;
    const keyManager = useMemo(() => new FlowNodeKeyManager(), []);
    const theme = useFlowTheme();
    const paragraphArray = useMemo(
        () => splitToParagraphs(content, theme, prevBreak, selection),
        [content, keyManager, theme, prevBreak, selection]
    );
    const keyRenderer = keyManager.createRenderer();
    const children = paragraphArray.length === 0 ? (
        <EmptyFlowContent selection={selection}/>
    ) : paragraphArray.map(({ theme: paraTheme, ...paraProps}) => (
        <ParagraphThemeScope 
            key={paraProps.breakNode ? keyRenderer.getNodeKey(paraProps.breakNode) : "$trailing-para"}
            theme={paraTheme}
            children={<ParagraphView {...paraProps}/>}
        />
    ));
    return <>{children}</>;
};

type SplitParaPickProps = "breakNode" | "children" | "opposingTags" | "prevBreak" | "selection";
interface SplitParaProps extends Pick<ParagraphViewProps, SplitParaPickProps> {
    theme: ParagraphTheme;
}

const splitToParagraphs = (
    source: FlowContent,
    theme: FlowTheme,
    prevBreak: ParagraphBreak | null,
    outerSelection: FlowSelection | boolean,
): SplitParaProps[] => {
    const result: SplitParaProps[] = [];
    let children: FlowNode[] = [];
    let opposingTags: OpposingTag[] = [];
    let index = 0;
    let position = 0;
    let startIndex = 0;
    let startPosition = 0;

    for (let cursor: FlowCursor | null = source.peek(); cursor; cursor = cursor.moveToStartOfNextNode()) {
        const { node } = cursor;
        if (!node) {
            continue;
        }
        children.push(node);
        opposingTags.push(getOpposingTag(cursor));
        ++index;
        position += node.size;

        if (node instanceof ParagraphBreak) {
            result.push({
                children,
                opposingTags,
                breakNode: node,
                prevBreak,
                theme: theme.getParagraphTheme(node.style.variant ?? "normal"),
                selection: getFlowFragmentSelection(
                    outerSelection,
                    source.nodes,
                    startIndex,
                    index - startIndex,
                    startPosition,
                    position - startPosition,
                ),
            });
            prevBreak = node;
            children = [];
            opposingTags = [];
            startIndex = index;
            startPosition = position;
        }        
    }

    if (children.length > 0) {
        result.push({
            children,
            opposingTags,
            breakNode: null,
            prevBreak,
            theme: theme.getParagraphTheme("normal"),
            selection: getFlowFragmentSelection(
                outerSelection,
                source.nodes,
                startIndex,
                index - startIndex,
                startPosition,
                position - startPosition,
            ),
        });
    }

    return result;
};

const getOpposingTag = (cursor: FlowCursor): OpposingTag => {
    const { node } = cursor;
    if (node instanceof StartMarkup) {
        return cursor.findMarkupEnd();
    } else if (node instanceof EndMarkup) {
        return cursor.findMarkupStart();
    } else {
        return null;
    }
};
