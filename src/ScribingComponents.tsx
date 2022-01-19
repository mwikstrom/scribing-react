import React, { createContext, FC, HTMLAttributes, ReactElement, ReactNode, useContext } from "react";
import { BoxStyle } from "scribing";
import { PreviewButton } from "./internal/PreviewButton";

/** @public */
export type ScribingComponent<P> = (props: P) => JSX.Element | null;

/** @public */
export interface ScribingComponents {
    Tooltip: ScribingComponent<ScribingTooltipProps>;
    Button: ScribingComponent<ScribingButtonProps>;
}

/** @public */
export interface ScribingTooltipProps {
    title: string | null;
    children: ReactElement;
}

/** @public */
export interface ScribingButtonProps extends HTMLAttributes<unknown> {
    pending: boolean;
    error: boolean;
    disabled: boolean;
    style: BoxStyle;
    hover: boolean;
    children: ReactNode;
    ref: (elem: HTMLElement | null) => void;
}

/** @public */
export const DefaultScribingComponents: ScribingComponents = Object.freeze({
    Tooltip: ({children}) => <>{children}</>,
    Button: PreviewButton,
});

/** @public */
export const useScribingComponents = (): ScribingComponents => useContext(ScribingComponentsContext);

/** @public */
export const ScribingComponentOverride: FC<Partial<ScribingComponents>> = props => {
    const { children, ...partial } = props;
    const components = { ...DefaultScribingComponents, ...partial };
    return (
        <ScribingComponentsContext.Provider
            value={components}
            children={children}
        />
    );    
};

const ScribingComponentsContext = createContext<ScribingComponents>(DefaultScribingComponents);
