import React, { FC } from "react";
import { createUseStyles } from "react-jss";
import { makeJssId } from "../utils/make-jss-id";

/** @internal */
export const ToolGroup: FC = ({children}) => {
    const classes = useStyles();
    return (
        <span 
            className={classes.root}
            children={children}
        />
    );
};

const useStyles = createUseStyles({
    root: {
        display: "inline-block",
    },
}, {
    generateId: makeJssId("ToolGroup"),
});
