import React, { FC } from "react";
import { createUseFlowStyles } from "./JssTheming";

/** @internal */
export interface TooltipMessageProps {
    text: string;
}

/** @internal */
export const TooltipMessage: FC<TooltipMessageProps> = ({text}) => {
    const classes = useStyles();
    return <div className={classes.root} children={text}/>;
};

const useStyles = createUseFlowStyles("TooltipMessage", () => ({
    root: {
        padding: "0.5rem 1rem"
    },
}));
