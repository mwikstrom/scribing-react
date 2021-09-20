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
    const mergedStyle = useMemo(
        () => theme.getAmbientParagraphStyle().merge(givenStyle),
        [givenStyle, theme]
    );
    const css = useMemo(() => getParagraphCssProperties(mergedStyle), [mergedStyle]);
    const classes = useStyles();
    const Component = getParagraphComponent(variant, components);
    const forwardProps = { theme, components, ...restProps };
    const keyRenderer = keyManager.createRenderer();
    const adjustedChildren = children.length === 0 || children[children.length - 1] instanceof LineBreak ?
        [...children, TextRun.fromData(" ")] : children;
    return (
        <Component
            style={css}
            className={clsx(classes.root, classes[variant])}
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

type ParagraphVariantClasses = Exclude<ParagraphStyleVariant, undefined>;

const useStyles = createUseStyles<"root" | ParagraphVariantClasses>({
    root: {
        minHeight: "1em",
    },
    normal: {},
    preamble: {},
    title: {},
    subtitle: {},
    code: {},
    h1: {},
    h2: {},
    h3: {},
    h4: {},
    h5: {},
    h6: {}
}, {
    generateId: makeJssId("Paragraph"),
});
