import React from "react";
import { createUseStyles } from "react-jss";
import { flowNode } from "./FlowNodeComponent";
import { makeJssId } from "./internal/utils/make-jss-id";

export const UnknownNodeView = flowNode((_, ref) => {
    const classes = useStyles();
    return (
        <span
            ref={ref}
            className={classes.root}
            children="\uFFFC"
        />
    );
});

const useStyles = createUseStyles({
    root: {
        opacity: 0.5,
        whiteSpace: "pre",
    },
}, {
    generateId: makeJssId("UnknownNode"),
});
