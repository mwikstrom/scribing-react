import clsx from "clsx";
import React, { FC, useCallback, useState } from "react";
import { useHover } from "../hooks/use-hover";
import { createUseFlowStyles } from "../JssTheming";

/** @internal */
export interface ToolButtonProps {
    active?: boolean;
    disabled?: boolean;
    setRef?: (elem: HTMLElement) => void;
    onClick?: () => void;
}

/** @internal */
export const ToolButton: FC<ToolButtonProps> = ({active, disabled, onClick, setRef: setOuterRef, children}) => {
    const classes = useStyles();
    const [rootElem, setRootElem] = useState<HTMLElement | null>(null);
    const hover = useHover(rootElem);
    const setRef = useCallback((elem: HTMLElement) => {
        setRootElem(elem);
        if (setOuterRef) {
            setOuterRef(elem);
        }
    }, [setOuterRef, setRootElem]);

    const className = clsx(
        classes.root,
        disabled && classes.disabled,
        active && classes.active,
        active === false && classes.inactive,
        !active && hover && !disabled && classes.hover,
    );

    return (
        <span 
            ref={setRef}
            className={className}
            children={children}
            onClick={!disabled ? onClick : undefined}
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
