import React, { FC, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { usePopper } from "react-popper";
import { useTransparentMouseWheel } from "../hooks/use-transparent-mouse-wheel";
import { useNativeEventHandler } from "../hooks/use-native-event-handler";
import { createUseFlowStyles } from "../JssTheming";
import { SYSTEM_FONT } from "../utils/system-font";
import { useElementSize } from "../hooks/use-element-size";

/** @internal */
export interface ToolMenuProps {
    anchor: HTMLElement,
    children: ReactNode;
    placement?: "bottom-start" | "bottom" | "bottom-end",
    closeOnMouseLeave?: boolean;
    boundary?: HTMLElement | null;
    onClose?: () => void;
}

/** @internal */
export const ToolMenu: FC<ToolMenuProps> = props => {
    const {
        anchor,
        children,
        onClose,
        placement = "bottom-start",
        closeOnMouseLeave = true,
        boundary: givenBoundary,
    } = props;
    const boundary = givenBoundary ?? "clippingParents";
    const [popper, setPopper] = useState<HTMLElement | null>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { styles, attributes, update } = usePopper(anchor, popper, {
        placement,
        strategy: "fixed",
        modifiers: [
            { name: "computeStyles", options: { gpuAcceleration: false, adaptive: false } },
            { name: "preventOverflow", options: { boundary, altAxis: true, padding: 10 } },
        ],
    });

    const classes = useStyles();
    const popperProps = {
        ...attributes.popper,
        className: classes.root, 
        style: styles.popper,
    };

    const isMouseOver = useCallback((e: MouseEvent) => (
        e.target instanceof Node && (
            (anchor !== null && anchor.contains(e.target)) ||
            (popper !== null && (e.target === popper || popper.contains(e.target)))
        )
    ), [anchor, popper]);

    useNativeEventHandler(window, "mousemove", (e: MouseEvent) => {
        if (!onClose) {
            return;
        }

        if (isMouseOver(e)) {
            if (closeTimer.current !== null) {
                clearTimeout(closeTimer.current);
                closeTimer.current = null;
            }
        } else if (closeTimer.current === null && closeOnMouseLeave) {
            closeTimer.current = setTimeout(onClose, 1000);
        }
    }, [isMouseOver, onClose]);

    useNativeEventHandler(window, "mousedown", (e: MouseEvent) => {
        if (onClose && !isMouseOver(e)) {
            onClose();
        }
    }, [isMouseOver, onClose]);

    useNativeEventHandler(givenBoundary ?? null, "scroll", () => {
        if (update) {
            update();
        }
    }, [update]);

    useTransparentMouseWheel(popper, givenBoundary);
    const { width, height } = useElementSize(popper);
    useEffect(() => {
        if (update) {
            update();
        }
    }, [width, height, update]);

    return (
        <div ref={setPopper} {...popperProps}>
            {children}
        </div>
    );
};

const useStyles = createUseFlowStyles("ToolMenu", ({palette}) => ({
    root: {
        display: "inline-block",
        backgroundColor: palette.menu,
        color: palette.menuText,
        fontFamily: SYSTEM_FONT,
        fontSize: "0.75rem",
        userSelect: "none",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: palette.menuBorder,
        boxShadow: "0 8px 8px rgba(0,0,0,0.25)",
        zIndex: 1000,
        maxHeight: "calc(80vh - 40px)",
        maxWidth: "calc(80vw - 40px)",
        overflow: "auto",
        "&::-webkit-scrollbar": {
            width: 4,
            height: 4,
        },
        "&::-webkit-scrollbar-track": {
            background: "transparent",
        },
        "&::-webkit-scrollbar-corner": {
            background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
            backgroundColor: palette.menuScrollbar,
            borderRadius: 2,
        },
    },
}));
