import clsx from "clsx";
import React, { FC, useCallback, useState } from "react";
import { createUseFlowStyles } from "../JssTheming";

/** @internal */
export interface ToolMenuItemProps {
    onClick?: () => void;
}

/** @internal */
export const ToolMenuItem: FC<ToolMenuItemProps> = ({onClick, children}) => {
    const classes = useStyles();
    const [hover, setHover] = useState(false);

    const className = clsx(
        classes.root,
        hover && classes.hover,
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

const useStyles = createUseFlowStyles("ToolMenuItem", ({palette}) => ({
    root: {
        display: "flex",
        alignItems: "center",
        padding: 4,
        cursor: "pointer",
        minWidth: 24,
        height: 24,
        whiteSpace: "nowrap",
    },
    hover: {
        backgroundColor: palette.hoverMenu,
    },
}));
