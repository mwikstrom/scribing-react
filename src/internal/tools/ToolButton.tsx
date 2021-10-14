import clsx from "clsx";
import React, { FC, useCallback, useState } from "react";
import { createUseFlowStyles } from "../JssTheming";

/** @internal */
export interface ToolButtonProps {
    active?: boolean;
    onClick?: () => void;
}

/** @internal */
export const ToolButton: FC<ToolButtonProps> = ({active, onClick, children}) => {
    const classes = useStyles();
    const [hover, setHover] = useState(false);

    const className = clsx(
        classes.root,
        active && classes.active,
        active === false && classes.inactive,
        !active && hover && classes.hover,
    );

    const onMouseEnter = useCallback(() => setHover(true), [setHover]);
    const onMouseLeave = useCallback(() => setHover(false), [setHover]);

    return (
        <span 
            className={className}
            children={children}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        />
    );
};

const useStyles = createUseFlowStyles("ToolButton", ({palette}) => ({
    root: {
        display: "inline-flex",
        alignItems: "center",
        padding: 4,
        cursor: "pointer",
        minWidth: 24,
        height: 24,
        borderRadius: 2,
        margin: 1,
    },
    active: {
        color: palette.activeToolText,
        backgroundColor: palette.activeTool,
    },
    inactive: {
        color: palette.inactiveToolText,
        backgroundColor: palette.inactiveTool,
    },
    hover: {
        backgroundColor: palette.hoverTool,
    },
}));
