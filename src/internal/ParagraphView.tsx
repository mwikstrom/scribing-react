import React, { FC, useMemo } from "react";
import clsx from "clsx";
import { createUseStyles } from "react-jss";
import { FlowNode, ParagraphBreak, ParagraphStyle, ParagraphStyleVariant } from "scribing";
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
    const { children, breakNode, theme: outerTheme, components, ...restProps } = props;
    const keyManager = useMemo(() => new FlowNodeKeyManager(), []);
    const variant = useMemo(() => breakNode?.style.variant ?? "normal", [breakNode]);
    const innerTheme = useMemo(() => outerTheme.getParagraphTheme(variant), [outerTheme, variant]);
    const givenStyle = useMemo(
        () => breakNode instanceof ParagraphBreak ? breakNode.style : ParagraphStyle.empty, 
        [breakNode]
    );
    const mergedStyle = useMemo(
        () => innerTheme.getAmbientParagraphStyle().merge(givenStyle),
        [givenStyle, innerTheme]
    );
    const css = useMemo(() => getParagraphCssProperties(mergedStyle), [mergedStyle]);
    const classes = useStyles();
    const Component = getParagraphComponent(variant, components);
    const forwardProps = { theme: innerTheme, components, ...restProps };
    const keyRenderer = keyManager.createRenderer();
    return (
        <Component
            style={css}
            className={clsx(classes.root, classes[variant])}
            children={children.map(child => (
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
