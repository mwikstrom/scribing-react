import React, { FC, ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { usePopper } from "react-popper";
import { useNativeEventHandler } from "../hooks/use-native-event-handler";
import { createUseFlowStyles } from "../JssTheming";
import { getScrollContainer } from "../utils/get-scroll-container";
import { SYSTEM_FONT } from "../utils/system-font";

/** @internal */
export interface ToolMenuProps {
    anchor: HTMLElement,
    children: ReactNode;
    onClose?: () => void;
}

/** @internal */
export const ToolMenu: FC<ToolMenuProps> = props => {
    const { anchor, children, onClose } = props;
    const [popper, setPopper] = useState<HTMLElement | null>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const scrollContainer = useMemo(
        () => anchor ? getScrollContainer(anchor) : null,
        [anchor]
    );

    const boundary = useMemo(
        () => scrollContainer instanceof Element ? scrollContainer : "clippingParents",
        [scrollContainer]
    );

    const { styles, attributes } = usePopper(anchor, popper, {
        placement: "bottom-start",
        modifiers: [
            { name: "computeStyles", options: { gpuAcceleration: false, adaptive: false } },
            { name: "preventOverflow", options: { boundary, altAxis: true, padding: 2 } },
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
        } else if (closeTimer.current === null) {
            closeTimer.current = setTimeout(onClose, 1000);
        }
    }, [isMouseOver, onClose]);

    useNativeEventHandler(window, "mousedown", (e: MouseEvent) => {
        if (onClose && !isMouseOver(e)) {
            onClose();
        }
    }, [isMouseOver, onClose]);

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
    },
}));
