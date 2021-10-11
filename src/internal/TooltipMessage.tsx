import React, { FC } from "react";
import { createUseFlowStyles } from "./JssTheming";
import { TooltipMessageProps } from "./Tooltip";

/** @internal */
export const TooltipMessage: FC<TooltipMessageProps> = ({text}) => {
    const classes = useStyles();
    return <div className={classes.root} children={text}/>;
};

const useStyles = createUseFlowStyles("TooltipMessage", () => ({
    root: {},
}));
