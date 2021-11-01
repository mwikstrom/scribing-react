import clsx from "clsx";
import React, { FC, useState } from "react";
import { useHover } from "../hooks/use-hover";
import { createUseFlowStyles } from "../JssTheming";

/** @internal */
export interface ToolMenuItemProps {
    disabled?: boolean;
    onClick?: () => void;
}

/** @internal */
export const ToolMenuItem: FC<ToolMenuItemProps> = ({onClick, disabled, children}) => {
    const classes = useStyles();
    const [rootElem, setRootElem] = useState<HTMLElement | null>(null);
    const hover = useHover(rootElem);

    const className = clsx(
        classes.root,
        hover && !disabled && classes.hover,
        disabled && classes.disabled,
    );

    return (
        <span 
            ref={setRootElem}
            className={className}
            children={children}
            onClick={disabled ? void(0) : onClick}
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
    disabled: {
        opacity: 0.5,
        cursor: "default",
    },
}));
