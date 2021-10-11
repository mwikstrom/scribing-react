import React, { FC } from "react";
import { createUseFlowStyles } from "./JssTheming";

/** @internal */
export const TooltipMessageList: FC = ({children}) => {
    const classes = useStyles();
    return <div className={classes.root} children={children}/>;
};

const useStyles = createUseFlowStyles("TooltipMessageList", () => ({
    root: {},
}));
