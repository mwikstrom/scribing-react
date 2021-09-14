import React, { FC, useMemo } from "react";
import clsx from "clsx";
import { createUseStyles } from "react-jss";
import { FlowNode, ParagraphStyle, ParagraphStyleProps } from "scribing";
import { getParagraphCssProperties } from "./para-css";
import { ParagraphElementView } from "./ParagraphElementView";
import { makeJssId } from "./make-jss-id";

/** @internal */
export interface ParagraphViewProps {
    nodes: FlowNode[];
    style: ParagraphStyle;
}

export const ParagraphView: FC<ParagraphViewProps> = props => {
    const { nodes, style } = props;
    const { type = "normal" } = style;
    const css = useMemo(() => getParagraphCssProperties(style), [style]);
    const classes = useStyles();
    const Component = getParagraphComponent(type);
    return (
        <Component
            style={css}
            className={clsx(classes.root, classes[type])}
            children={nodes.map(n => <ParagraphElementView key={n.transientKey} node={n}/>)}
        />
    );
};

const getParagraphComponent = (type: ParagraphStyleProps["type"] = "normal") => (
    type === "normal" ? "p" :
        type === "title" || type === "subtitle" ? "div" :
            type
);

type ParagraphTypeClasses = Exclude<ParagraphStyleProps["type"], undefined>;
const useStyles = createUseStyles<"root" | ParagraphTypeClasses>({
    root: {},
    normal: {},
    title: {},
    subtitle: {},
    h1: {},
    h2: {},
    h3: {},
    h4: {},
    h5: {},
    h6: {}
}, {
    generateId: makeJssId("Paragraph"),
});
