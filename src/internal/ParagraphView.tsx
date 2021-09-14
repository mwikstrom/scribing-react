import React, { FC, useMemo } from "react";
import clsx from "clsx";
import { createUseStyles } from "react-jss";
import { FlowNode, LineBreak, ParagraphBreak, ParagraphStyleProps } from "scribing";
import { getParagraphCssProperties } from "./para-css";
import { makeJssId } from "./make-jss-id";
import { LineView, LineViewProps } from "./LineView";

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
    const lineArray = useMemo(() => splitToLines(children), [children]);
    const Component = getParagraphComponent(typeClass);
    return (
        <Component
            style={css}
            className={clsx(classes.root, classes[typeClass])}
            children={lineArray.map(line => <LineView {...line}/>)}
        />
    );
};

interface Line extends LineViewProps {
    key: string;
}

const splitToLines = (source: readonly FlowNode[]): Line[] => {
    const result: Line[] = [];
    let children: FlowNode[] = [];

    for (const node of source) {
        children.push(node);
        if (node instanceof LineBreak) {
            const { transientKey: key } = node;
            result.push({ key, children });
            children = [];
        }
    }

    if (children.length > 0) {
        const key = "$trailing-line";
        result.push({ key, children });
    }

    return result;
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
