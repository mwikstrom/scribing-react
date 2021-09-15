import React, { FC, useMemo } from "react";
import clsx from "clsx";
import { createUseStyles } from "react-jss";
import { FlowNode, ParagraphBreak, ParagraphStyleProps } from "scribing";
import { getParagraphCssProperties } from "./para-css";
import { makeJssId } from "./make-jss-id";
import { FlowNodeView } from "./FlowNodeView";

/** @internal */
export interface ParagraphViewProps {
    children: FlowNode[];
    breakNode: ParagraphBreak | null;
}

export const ParagraphView: FC<ParagraphViewProps> = props => {
    const { children, breakNode } = props;
    const typeClass = useMemo(() => {
        if (breakNode instanceof ParagraphBreak) {
            return breakNode.style.type ?? "normal";
        } else {
            return "trailing";
        }
    }, [breakNode]);
    const css = useMemo(() => {
        if (breakNode instanceof ParagraphBreak) {
            return getParagraphCssProperties(breakNode.style);
        } else {
            return {};
        }
    }, [breakNode]);
    const classes = useStyles();
    const Component = getParagraphComponent(typeClass);
    return (
        <Component
            style={css}
            className={clsx(classes.root, classes[typeClass])}
            children={children.map(child => <FlowNodeView key={child.transientKey} node={child}/>)}
        />
    );
};

const getParagraphComponent = (type: ParagraphTypeClasses) => {
    switch (type) {
    case "normal": return "p";
    case "trailing": return "p";
    case "title": return "div";
    case "subtitle": return "div";
    default: return type;
    }
};

type ParagraphTypeClasses = Exclude<ParagraphStyleProps["type"], undefined> | "trailing";

const useStyles = createUseStyles<"root" | ParagraphTypeClasses>({
    root: {},
    normal: {},
    trailing: {},
    title: {},
    subtitle: {},
    h1: {},
    h2: {},
    h3: {},
    h4: {},
    h5: {},
    h6: {}
}, {
    generateId: makeJssId("Para"),
});
