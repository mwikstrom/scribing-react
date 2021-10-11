import React, { FC } from "react";
import { createUseFlowStyles } from "./JssTheming";

/** @internal */
export const TooltipDivider: FC = () => {
    const classes = useStyles();
    return <div className={classes.root}/>;
};

const useStyles = createUseFlowStyles("TooltipDivider", ({palette}) => ({
    root: {
        marginTop: 4,
        marginBottom: 4,
        height: 1,
        backgroundColor: palette.tooltipText,
        opacity: 0.5,
    },
}));
