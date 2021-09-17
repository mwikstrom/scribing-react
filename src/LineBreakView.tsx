import React from "react";
import { createUseStyles } from "react-jss";
import { LineBreak } from "scribing";
import { FlowNodeComponent } from "./FlowNodeComponent";
import { makeJssId } from "./internal/utils/make-jss-id";

export const LineBreakView: FlowNodeComponent<LineBreak> = props => {
    const { ref } = props;
    const classes = useStyles();
    return (
        <span
            ref={ref}
            className={classes.root}
            children={"↵\n"}
        />
    );
};

const useStyles = createUseStyles({
    root: {
        opacity: 0.5,
        whiteSpace: "pre",
    },
}, {
    generateId: makeJssId("LineBreak"),
});

