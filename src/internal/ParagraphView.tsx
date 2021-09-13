import React, { FC, useMemo } from "react";
import { FlowNode, ParagraphStyle, ParagraphStyleProps } from "scribing";
import { getParagraphCssProperties } from "./para-css";
import { ParagraphElementView } from "./ParagraphElementView";

/** @internal */
export interface ParagraphViewProps {
    nodes: FlowNode[];
    style: ParagraphStyle;
}

export const ParagraphView: FC<ParagraphViewProps> = props => {
    const { nodes, style } = props;
    const { type = "normal" } = style;
    const css = useMemo(() => getParagraphCssProperties(style), [style]);
    const Component = getParagraphComponent(type);
    return (
        <Component
            style={css}
            className={`scribing-para-type-${type}`}
            children={nodes.map(n => <ParagraphElementView key={n.transientKey} node={n}/>)}
        />
    );
};

const getParagraphComponent = (type: ParagraphStyleProps["type"] = "normal") => (
    type === "normal" ? "p" :
        type === "title" || type === "subtitle" ? "div" :
            type
);
