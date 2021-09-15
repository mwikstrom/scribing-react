import React, { FC, useMemo, useRef } from "react";
import { createUseStyles } from "react-jss";
import { TextRun } from "scribing";
import { useNodeMapping } from "./dom-mapping";
import { makeJssId } from "./make-jss-id";
import { getTextCssProperties } from "./text-css";

/** @internal */
export interface TextRunViewProps {
    node: TextRun;
}

export const TextRunView: FC<TextRunViewProps> = props => {
    const { node } = props;
    const { text, style } = node;
    const css = useMemo(() => getTextCssProperties(style), [style]);
    const rootRef = useRef<HTMLSpanElement | null>(null);
    const classes = useStyles();
    useNodeMapping(rootRef, node);
    return (
        <span
            ref={rootRef}
            className={classes.root}
            style={css}
            children={text}
        />
    );
};

const useStyles = createUseStyles({
    root: {
        whiteSpace: "pre-wrap", // Preserve white space, wrap as needed
    },
}, {
    generateId: makeJssId("TextRun"),
});
