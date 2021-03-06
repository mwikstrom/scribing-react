import React from "react";
import { createUseStyles } from "react-jss";
import { flowNode } from "./FlowNodeComponent";
import { makeJssId } from "./utils/make-jss-id";

export const UnknownNodeView = flowNode((_, ref) => {
    const classes = useStyles();
    return (
        <span
            ref={ref}
            className={classes.root}
            contentEditable={false}
            children={"\uFFFC"}
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
