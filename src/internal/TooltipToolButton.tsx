import clsx from "clsx";
import React, { FC } from "react";
import { createUseFlowStyles } from "./JssTheming";

/** @internal */
export interface TooltipToolButtonProps {
    checked?: boolean;
    onClick?: () => void;
}

/** @internal */
export const TooltipToolButton: FC<TooltipToolButtonProps> = ({checked, onClick, children}) => {
    const classes = useStyles();
    const className = clsx(classes.root, checked && classes.checked);
    return (
        <span 
            className={className}
            children={children}
            onClick={onClick}
        />
    );
};

const useStyles = createUseFlowStyles("TooltipToolButton", ({palette}) => ({
    root: {
        display: "inline-block",
        padding: 4,
        cursor: "pointer",
    },
    checked: {
        color: palette.activeToolText,
        backgroundColor: palette.activeTool,
    },
}));
