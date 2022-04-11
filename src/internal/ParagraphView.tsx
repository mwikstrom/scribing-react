import React, { FC, useMemo } from "react";
import clsx from "clsx";
import { createUseStyles } from "react-jss";
import { 
    FlowNode, 
    FlowSelection, 
    InlineNode, 
    Interaction, 
    LineBreak, 
    ParagraphBreak, 
    ParagraphStyle, 
    TextRun
} from "scribing";
import { getParagraphCssProperties } from "./utils/paragraph-style-to-css";
import { makeJssId } from "./utils/make-jss-id";
import { FlowNodeView } from "./FlowNodeView";
import { FlowNodeKeyManager } from "./FlowNodeKeyManager";
import { FlowNodeComponentProps, OpposingTag } from "./FlowNodeComponent";
import { getParagraphStyleClassNames, listIndent, PARAGRAPH_STYLE_CLASSES } from "./utils/paragraph-style-to-classes";
import { LinkView, LinkViewProps } from "./LinkView";
import { getListMarkerClass } from "./utils/list-marker";
import { useParagraphTheme } from "./ParagraphThemeScope";
import { useFlowComponentMap } from "./FlowComponentMapScope";
import { useFlowPalette } from "../FlowPaletteScope";
import { getFlowFragmentSelection, getFlowNodeSelection } from "./utils/get-sub-selection";
import { useFlowTypography } from "../FlowTypographyScope";
import { ReducedBlockSizeScope } from "./BlockSize";

/** @internal */
export type ParagraphViewProps = Omit<FlowNodeComponentProps, "node" | "ref" | "opposingTag"> & {
    children: readonly FlowNode[];
    opposingTags: readonly OpposingTag[];
    breakNode?: ParagraphBreak | null;
    prevBreak?: ParagraphBreak | null;
}

/** @internal */
export const ParagraphView: FC<ParagraphViewProps> = props => {
    const { children: childNodes, opposingTags, breakNode = null, prevBreak = null, selection } = props;
    const keyManager = useMemo(() => new FlowNodeKeyManager(), []);
    const variant = useMemo(() => breakNode?.style.variant ?? "normal", [breakNode]);
    const givenStyle = useMemo(
        () => breakNode instanceof ParagraphBreak ? breakNode.style : ParagraphStyle.empty, 
        [breakNode]
    );
    const theme = useParagraphTheme();
    const style = useMemo(
        () => theme.getAmbientParagraphStyle().merge(givenStyle),
        [givenStyle, theme]
    );
    const css = useMemo(() => getParagraphCssProperties(style), [style]);
    const classes = useStyles();
    const palette = useFlowPalette();
    const typography = useFlowTypography();
    const listMarkerClass = useMemo(
        () => getListMarkerClass(style, theme.getAmbientTextStyle(), prevBreak, palette, typography),
        [style, theme, prevBreak, palette, typography]
    );
    const className = useMemo(() => clsx(
        classes.root,
        listMarkerClass,
        ...getParagraphStyleClassNames(style, classes),
    ), [style, classes]);
    const components = useFlowComponentMap();
    const Component = components[variant];
    const nodesAndLinks = useMemo(() => {
        let adjustedNodes = childNodes;
        let adjustedOpposingTags = opposingTags;
        if (childNodes.length === 0 || childNodes[childNodes.length - 1] instanceof LineBreak) {
            adjustedNodes = [...adjustedNodes, TextRun.fromData(" ")];
            adjustedOpposingTags = [...adjustedOpposingTags, null];
        }
        return splitToLinks(adjustedNodes, adjustedOpposingTags, selection);
    }, [childNodes, opposingTags, selection]);
    const keyRenderer = keyManager.createRenderer();
    return (
        <Component className={className} style={css}>
            <ReducedBlockSizeScope decrement={style.listLevel ? listIndent(style.listLevel) : undefined}>
                {nodesAndLinks.map(nodeOrLinkProps => (
                    isNodeProps(nodeOrLinkProps) ? (
                        <FlowNodeView
                            key={keyRenderer.getNodeKey(nodeOrLinkProps.node)}
                            node={nodeOrLinkProps.node}
                            opposingTag={nodeOrLinkProps.opposingTag}
                            selection={nodeOrLinkProps.selection}
                            singleNodeInPara={nodesAndLinks.length === 1}
                        />
                    ) : (
                        <LinkView
                            key={keyRenderer.getNodeKey(nodeOrLinkProps.firstNode)}
                            children={nodeOrLinkProps.children}
                            opposingTags={nodeOrLinkProps.opposingTags}
                            link={nodeOrLinkProps.link}
                            selection={nodeOrLinkProps.selection}
                        />
                    )
                ))}
            </ReducedBlockSizeScope>
        </Component>
    );
};

const useStyles = createUseStyles({
    ...PARAGRAPH_STYLE_CLASSES,
    root: {
        minHeight: "1rem",
    },
}, {
    generateId: makeJssId("Paragraph"),
});

type SplitLinkProps = Pick<LinkViewProps, "children" | "opposingTags" | "link" | "selection"> & { firstNode: FlowNode };
interface NodeProps { node: FlowNode, opposingTag: OpposingTag, selection: FlowSelection | boolean }
type SplitItem = NodeProps | SplitLinkProps;

function isNodeProps(item: SplitItem): item is NodeProps {
    return "node" in item;
}

const splitToLinks = (
    nodes: readonly FlowNode[],
    opposingTags: readonly OpposingTag[],
    outerSelection: FlowSelection | boolean,
): SplitItem[] => {
    const result: SplitItem[] = [];
    let linkProps: (Omit<SplitLinkProps, "selection"> & {startIndex: number, startPosition: number}) | null = null;
    let index = 0;
    let position = 0;

    const pushLink = () => {
        if (linkProps) {
            const { startIndex, startPosition, ...rest } = linkProps;
            const selection = getFlowFragmentSelection(
                outerSelection,
                nodes,
                index,
                index - startIndex,
                startPosition,
                position - startPosition,
            );
            result.push({ ...rest, selection });
            linkProps = null;
        }
    };
    
    for (let i = 0; i < nodes.length; ++i) {
        const node = nodes[i];
        const opposingTag = opposingTags[i];
        const link = getLink(node);

        if (link) {
            if (linkProps && !Interaction.baseType.equals(link, linkProps.link)) {
                pushLink();
            }

            if (!linkProps) {
                linkProps = {
                    children: [],
                    opposingTags: [],
                    link,
                    firstNode: node,
                    startIndex: index,
                    startPosition: position,
                };
            }

            linkProps.children.push(node);
            linkProps.opposingTags.push(opposingTag);
        } else {
            pushLink();
            result.push({ 
                node, 
                opposingTag,
                selection: getFlowNodeSelection(outerSelection, nodes, index, node, position),
            });
        }

        ++index;
        position += node.size;
    }

    pushLink();
    return result;
};

const getLink = (node: FlowNode): Interaction | null => (
    node instanceof InlineNode ? node.style.link ?? null : null
);