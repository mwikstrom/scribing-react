import React, { FC, useMemo } from "react";
import clsx from "clsx";
import { createUseStyles } from "react-jss";
import { FlowNode, LineBreak, ParagraphBreak, ParagraphStyle, ParagraphStyleVariant, TextRun } from "scribing";
import { getParagraphCssProperties } from "./utils/paragraph-style-to-css";
import { makeJssId } from "./utils/make-jss-id";
import { FlowNodeView } from "../FlowNodeView";
import { FlowNodeKeyManager } from "./FlowNodeKeyManager";
import { FlowNodeComponentProps } from "../FlowNodeComponent";
import { DefaultFlowNodeComponents } from "./DefaultFlowNodeComponents";
import { FlowNodeComponentMap, ParagraphComponent } from "..";
import { getParagraphStyleClassNames, PARAGRAPH_STYLE_CLASSES } from "./utils/paragraph-style-to-classes";

/** @internal */
export type ParagraphViewProps = Omit<FlowNodeComponentProps, "node" | "ref"> & {
    children: FlowNode[];
    breakNode: ParagraphBreak | null;
}

/** @internal */
export const ParagraphView: FC<ParagraphViewProps> = props => {
    const { children, breakNode, theme, components, ...restProps } = props;
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
    const className = useMemo(
        () => clsx(classes.root, ...getParagraphStyleClassNames(style, classes)),
        [style, classes]
    );
    const Component = getParagraphComponent(variant, components);
    const forwardProps = { theme, components, ...restProps };
    const keyRenderer = keyManager.createRenderer();
    const adjustedChildren = children.length === 0 || children[children.length - 1] instanceof LineBreak ?
        [...children, TextRun.fromData(" ")] : children;
    return (
        <Component
            className={className}
            style={css}
            children={adjustedChildren.map(child => (
                <FlowNodeView
                    key={keyRenderer.getNodeKey(child)}
                    node={child}
                    {...forwardProps}
                />
            ))}
        />
    );
};

const getParagraphComponent = (
    variant: ParagraphStyleVariant,
    components?: Partial<FlowNodeComponentMap>
): ParagraphComponent => {
    if (components && components.paragraph) {
        return components.paragraph(variant);
    } else {
        return DefaultFlowNodeComponents.paragraph(variant);
    }
};

const useStyles = createUseStyles({
    ...PARAGRAPH_STYLE_CLASSES,
    root: {
        minHeight: "1rem",
    },
}, {
    generateId: makeJssId("Paragraph"),
});
