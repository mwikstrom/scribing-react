import React, { FC } from "react";
import { createUseStyles } from "react-jss";
import { makeJssId } from "./utils/make-jss-id";

/** @internal */
export interface TooltipMessageProps {
    text: string;
}

/** @internal */
export const TooltipMessage: FC<TooltipMessageProps> = ({text}) => {
    const classes = useStyles();
    return <div className={classes.root} children={text}/>;
};

const useStyles = createUseStyles({
    root: {
        padding: "0.5rem 1rem"
    },
}, {
    generateId: makeJssId("TooltipMessage"),
});
