import React, { FC } from "react";
import { createUseFlowStyles } from "../JssTheming";

/** @internal */
export const ToolMenuDivider: FC = () => {
    const classes = useStyles();
    return <div className={classes.root}/>;
};

const useStyles = createUseFlowStyles("ToolMenuDivider", ({palette}) => ({
    root: {
        backgroundColor: palette.menuBorder,
        marginTop: 4,
        marginBottom: 4,
        height: 1,
    },
}));
