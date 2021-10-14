import React, { FC } from "react";
import { createUseFlowStyles } from "./JssTheming";

/** @internal */
export const ToolDivider: FC = () => {
    const classes = useStyles();
    return <span className={classes.root}/>;
};

const useStyles = createUseFlowStyles("ToolDivider", ({palette}) => ({
    root: {
        display: "inline-block",
        width: 0.5,
        height: 24,
        backgroundColor: palette.toolDivider,
        margin: "0 2px",
    },
}));
