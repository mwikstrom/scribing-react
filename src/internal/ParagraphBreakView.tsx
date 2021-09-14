import React, { FC, useRef } from "react";
import { createUseStyles } from "react-jss";
import { ParagraphBreak } from "scribing";
import { useNodeMapping } from "./dom-mapping";
import { makeJssId } from "./make-jss-id";

/** @internal */
export interface ParagraphBreakViewProps {
    node: ParagraphBreak;
}

export const ParagraphBreakView: FC<ParagraphBreakViewProps> = props => {
    const { node } = props;
    const rootRef = useRef<HTMLSpanElement | null>(null);
    const classes = useStyles();
    useNodeMapping(rootRef, node);
    return (
        <span
            ref={rootRef}
            className={classes.root}
            contentEditable={false}
            children="¶"
        />
    );
};

const useStyles = createUseStyles({
    root: {
        opacity: 0.5,
    },
}, {
    generateId: makeJssId("ParagraphBreak"),
});
