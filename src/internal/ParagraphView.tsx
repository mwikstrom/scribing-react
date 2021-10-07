import React, { FC, useMemo } from "react";
import clsx from "clsx";
import { createUseStyles } from "react-jss";
import { 
    FlowNode, 
    InlineNode, 
    Interaction, 
    LineBreak, 
    ParagraphBreak, 
    ParagraphStyle, 
    TextRun
} from "scribing";
import { getParagraphCssProperties } from "./utils/paragraph-style-to-css";
import { makeJssId } from "./utils/make-jss-id";
import { FlowNodeView } from "../FlowNodeView";
import { FlowNodeKeyManager } from "./FlowNodeKeyManager";
import { FlowNodeComponentProps } from "../FlowNodeComponent";
import { getParagraphStyleClassNames, PARAGRAPH_STYLE_CLASSES } from "./utils/paragraph-style-to-classes";
import { LinkView, LinkViewProps } from "./LinkView";
import { getListMarkerClass } from "./utils/list-marker";
import { useParagraphTheme } from "../ParagraphThemeScope";
import { useFlowComponentMap } from "../FlowComponentMapScope";
import { useFlowPalette } from "../FlowPaletteScope";

/** @internal */
export type ParagraphViewProps = Omit<FlowNodeComponentProps, "node" | "ref"> & {
    children: FlowNode[];
    breakNode: ParagraphBreak | null;
    prevBreak: ParagraphBreak | null;
}

/** @internal */
export const ParagraphView: FC<ParagraphViewProps> = props => {
    const { children: childNodes, breakNode, prevBreak, position: start } = props;
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
    const nodesWithLinks = useMemo(() => splitToLinks(start, adjustedNodes), [start, adjustedNodes]);
    const keyRenderer = keyManager.createRenderer();
    return (
        <Component className={className} style={css}>
            {nodesWithLinks.map(({nodeOrLinkProps, position}) => (
                nodeOrLinkProps instanceof FlowNode ? (
                    <FlowNodeView
                        key={keyRenderer.getNodeKey(nodeOrLinkProps)}
                        node={nodeOrLinkProps}
                        position={position}
                    />
                ) : (
                    <LinkView
                        key={keyRenderer.getNodeKey(nodeOrLinkProps.firstNode)}
                        children={nodeOrLinkProps.children}
                        link={nodeOrLinkProps.link}
                        position={position}
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

type SplitLinkProps = Pick<LinkViewProps, "children" | "link"> & { firstNode: FlowNode };
interface SplitItem {
    nodeOrLinkProps: FlowNode | SplitLinkProps;
    position: number;
}

const splitToLinks = (position: number, nodes: readonly FlowNode[]): SplitItem[] => {
    const result: SplitItem[] = [];
    let linkPosition = position;
    let linkProps: SplitLinkProps | null = null;
    
    for (const node of nodes) {
        if (node instanceof InlineNode) {
            const { style: { link = null } } = node;
            if (link) {
                if (linkProps && !Interaction.baseType.equals(link, linkProps.link)) {
                    result.push({
                        nodeOrLinkProps: linkProps,
                        position: linkPosition,
                    });
                    linkProps = null;
                }

                if (!linkProps) {
                    linkPosition = position;
                    linkProps = {
                        children: [],
                        link,
                        firstNode: node,
                    };
                }

                linkProps.children.push(node);
            } else if (linkProps) {
                result.push({
                    nodeOrLinkProps: linkProps,
                    position: linkPosition,
                });
                linkProps = null;
            } else {
                result.push({
                    nodeOrLinkProps: node,
                    position,
                });
            }
        } else if (linkProps) {
            result.push({
                nodeOrLinkProps: linkProps,
                position: linkPosition,
            });
            linkProps = null;
        } else {
            result.push({
                nodeOrLinkProps: node,
                position,
            });
        }
        position += node.size;
    }

    if (linkProps) {
        result.push({
            nodeOrLinkProps: linkProps,
            position: linkPosition,
        });
    }

    return result;
};
