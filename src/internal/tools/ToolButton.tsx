import clsx from "clsx";
import React, { FC, useCallback, useState } from "react";
import { createUseFlowStyles } from "../JssTheming";

/** @internal */
export interface ToolButtonProps {
    active?: boolean;
    disabled?: boolean;
    setRef?: (elem: HTMLElement) => void;
    onClick?: () => void;
}

/** @internal */
export const ToolButton: FC<ToolButtonProps> = ({active, disabled, onClick, setRef, children}) => {
    const classes = useStyles();
    const [hover, setHover] = useState(false);

    const className = clsx(
        classes.root,
        disabled && classes.disabled,
        active && classes.active,
        active === false && classes.inactive,
        !active && hover && !disabled && classes.hover,
    );

    const onMouseEnter = useCallback(() => setHover(true), [setHover]);
    const onMouseLeave = useCallback(() => setHover(false), [setHover]);

    return (
        <span 
            ref={setRef}
            className={className}
            children={children}
            onClick={!disabled ? onClick : undefined}
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
        margin: 0.5,
    },
    disabled: {
        opacity: 0.5,
        cursor: "default",
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
