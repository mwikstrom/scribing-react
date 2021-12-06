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
import { FlowNodeComponentProps } from "./FlowNodeComponent";
import { getParagraphStyleClassNames, PARAGRAPH_STYLE_CLASSES } from "./utils/paragraph-style-to-classes";
import { LinkView, LinkViewProps } from "./LinkView";
import { getListMarkerClass } from "./utils/list-marker";
import { useParagraphTheme } from "./ParagraphThemeScope";
import { useFlowComponentMap } from "./FlowComponentMapScope";
import { useFlowPalette } from "../FlowPaletteScope";
import { getFlowFragmentSelection, getFlowNodeSelection } from "./utils/get-sub-selection";

/** @internal */
export type ParagraphViewProps = Omit<FlowNodeComponentProps, "node" | "ref"> & {
    children: readonly FlowNode[];
    breakNode?: ParagraphBreak | null;
    prevBreak?: ParagraphBreak | null;
}

/** @internal */
export const ParagraphView: FC<ParagraphViewProps> = props => {
    const { children: childNodes, breakNode = null, prevBreak = null, selection } = props;
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
    const listMarkerClass = useMemo(
        () => getListMarkerClass(style, theme.getAmbientTextStyle(), prevBreak, palette),
        [style, theme, prevBreak, palette]
    );
    const className = useMemo(() => clsx(
        classes.root,
        listMarkerClass,
        ...getParagraphStyleClassNames(style, classes),
    ), [style, classes]);
    const components = useFlowComponentMap();
    const Component = components[variant];
    const adjustedNodes = useMemo(() => (
        childNodes.length === 0 || childNodes[childNodes.length - 1] instanceof LineBreak ?
            [...childNodes, TextRun.fromData(" ")] : childNodes
    ), [childNodes]);
    const nodesAndLinks = useMemo(() => splitToLinks(adjustedNodes, selection), [adjustedNodes, selection]);
    const keyRenderer = keyManager.createRenderer();
    return (
        <Component className={className} style={css}>
            {nodesAndLinks.map(nodeOrLinkProps => (
                isNodeProps(nodeOrLinkProps) ? (
                    <FlowNodeView
                        key={keyRenderer.getNodeKey(nodeOrLinkProps.node)}
                        node={nodeOrLinkProps.node}
                        selection={nodeOrLinkProps.selection}
                        singleNodeInPara={nodesAndLinks.length === 1}
                    />
                ) : (
                    <LinkView
                        key={keyRenderer.getNodeKey(nodeOrLinkProps.firstNode)}
                        children={nodeOrLinkProps.children}
                        link={nodeOrLinkProps.link}
                        selection={nodeOrLinkProps.selection}
                    />
                )
            ))}
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

type SplitLinkProps = Pick<LinkViewProps, "children" | "link" | "selection"> & { firstNode: FlowNode };
interface NodeProps { node: FlowNode, selection: FlowSelection | boolean }
type SplitItem = NodeProps | SplitLinkProps;

function isNodeProps(item: SplitItem): item is NodeProps {
    return "node" in item;
}

const splitToLinks = (nodes: readonly FlowNode[], outerSelection: FlowSelection | boolean): SplitItem[] => {
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
    
    for (const node of nodes) {
        const link = getLink(node);

        if (link) {
            if (linkProps && !Interaction.baseType.equals(link, linkProps.link)) {
                pushLink();
            }

            if (!linkProps) {
                linkProps = {
                    children: [],
                    link,
                    firstNode: node,
                    startIndex: index,
                    startPosition: position,
                };
            }

            linkProps.children.push(node);
        } else {
            pushLink();
            result.push({ 
                node, 
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