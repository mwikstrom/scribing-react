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

/** @internal */
export type ParagraphViewProps = Omit<FlowNodeComponentProps, "node" | "ref"> & {
    children: FlowNode[];
    breakNode: ParagraphBreak | null;
    prevBreak: ParagraphBreak | null;
}

/** @internal */
export const ParagraphView: FC<ParagraphViewProps> = props => {
    const { children: childNodes, breakNode, prevBreak, theme, components, ...restProps } = props;
    const keyManager = useMemo(() => new FlowNodeKeyManager(), []);
    const variant = useMemo(() => breakNode?.style.variant ?? "normal", [breakNode]);
    const givenStyle = useMemo(
        () => breakNode instanceof ParagraphBreak ? breakNode.style : ParagraphStyle.empty, 
        [breakNode]
    );
    const style = useMemo(
        () => theme.getAmbientParagraphStyle().merge(givenStyle),
        [givenStyle, theme]
    );
    const css = useMemo(() => getParagraphCssProperties(style), [style]);
    const classes = useStyles();
    const listMarkerClass = useMemo(
        () => getListMarkerClass(style, theme.getAmbientTextStyle(), prevBreak),
        [style, theme, prevBreak]
    );
    const className = useMemo(() => clsx(
        classes.root,
        listMarkerClass,
        ...getParagraphStyleClassNames(style, classes),
    ), [style, classes]);
    const Component = components.paragraph(variant);
    const forwardProps = { theme, components, ...restProps };
    const adjustedNodes = useMemo(() => (
        childNodes.length === 0 || childNodes[childNodes.length - 1] instanceof LineBreak ?
            [...childNodes, TextRun.fromData(" ")] : childNodes
    ), [childNodes]);
    const nodesWithLinks = useMemo(() => splitToLinks(adjustedNodes), [adjustedNodes]);
    const keyRenderer = keyManager.createRenderer();
    return (
        <Component className={className} style={css}>
            {nodesWithLinks.map(nodeOrLinkProps => (
                nodeOrLinkProps instanceof FlowNode ? (
                    <FlowNodeView
                        key={keyRenderer.getNodeKey(nodeOrLinkProps)}
                        node={nodeOrLinkProps}
                        {...forwardProps}
                    />
                ) : (
                    <LinkView
                        key={keyRenderer.getNodeKey(nodeOrLinkProps.firstNode)}
                        children={nodeOrLinkProps.children}
                        link={nodeOrLinkProps.link}
                        {...forwardProps}
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

const splitToLinks = (nodes: readonly FlowNode[]): (FlowNode | SplitLinkProps)[] => {
    const result: (FlowNode | SplitLinkProps)[] = [];
    let linkProps: SplitLinkProps | null = null;
    
    for (const node of nodes) {
        if (node instanceof InlineNode) {
            const { style: { link = null } } = node;
            if (link) {
                if (linkProps && !Interaction.baseType.equals(link, linkProps.link)) {
                    result.push(linkProps);
                    linkProps = null;
                }

                if (!linkProps) {
                    linkProps = {
                        children: [],
                        link,
                        firstNode: node,
                    };
                }

                linkProps.children.push(node);
                continue;
            } else if (linkProps) {
                result.push(linkProps);
                linkProps = null;
            }
        }
        result.push(node);
    }

    if (linkProps) {
        result.push(linkProps);
    }

    return result;
};
