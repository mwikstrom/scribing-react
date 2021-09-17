import React from "react";
import { createUseStyles } from "react-jss";
import { ParagraphBreak } from "scribing";
import { flowNode } from "./FlowNodeComponent";
import { makeJssId } from "./internal/utils/make-jss-id";

export const ParagraphBreakView = flowNode<ParagraphBreak>((_, ref) => {
    const classes = useStyles();
    return (
        <span
            ref={ref}
            className={classes.root}
            children="¶"
        />
    );
});

const useStyles = createUseStyles({
    root: {
        opacity: 0.5,
    },
}, {
    generateId: makeJssId("ParagraphBreak"),
});
