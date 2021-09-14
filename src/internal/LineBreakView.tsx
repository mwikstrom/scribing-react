import React, { FC, useRef } from "react";
import { createUseStyles } from "react-jss";
import { LineBreak } from "scribing";
import { useNodeMapping } from "./dom-mapping";
import { makeJssId } from "./make-jss-id";

/** @internal */
export interface LineBreakViewProps {
    node: LineBreak;
}

export const LineBreakView: FC<LineBreakViewProps> = props => {
    const { node } = props;
    const rootRef = useRef<HTMLSpanElement | null>(null);
    const classes = useStyles();
    useNodeMapping(rootRef, node);
    return (
        <span
            ref={rootRef}
            className={classes.root}
            children="↵"
        />
    );
};

const useStyles = createUseStyles({
    root: {
        opacity: 0.5,
    },
}, {
    generateId: makeJssId("LineBreak"),
});

