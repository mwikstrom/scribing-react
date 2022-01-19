import clsx from "clsx";
import React, { forwardRef, useMemo } from "react";
import { ScribingButtonProps } from "../ScribingComponents";
import { useForwardedRef } from "./hooks/use-forwarded-ref";
import { createUseFlowStyles } from "./JssTheming";
import { boxStyles, getBoxStyleClassNames } from "./utils/box-style-to-classes";

/** @internal */
export const PreviewButton = forwardRef<HTMLElement, ScribingButtonProps>((props, outerRef) => {
    const { pending, error, disabled, style, children, ...otherProps } = props;
    const innerRef = useForwardedRef(outerRef);
    const classes = useStyles();
    const className = useMemo(() => clsx(
        classes.root,
        pending && classes.pending,
        ...getBoxStyleClassNames(error ? style.set("color", "error") : style, classes),
    ), [classes, pending, style]);
    return (
        <button
            {...otherProps}
            ref={innerRef}
            className={className}
            disabled={disabled || pending}
            children={children}
        />
    );
});

const useStyles = createUseFlowStyles("Button", ({palette}) => ({
    ...boxStyles(palette),
    root: {},
    pending: {
        cursor: "wait",
    },
}));
