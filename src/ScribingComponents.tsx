import React, { createContext, FC, HTMLAttributes, ReactElement, ReactNode, useContext } from "react";
import { BoxStyle } from "scribing";
import { PreviewButton } from "./internal/PreviewButton";

/** @public */
export type ScribingComponent<P> = (props: P) => JSX.Element | null;

/** @public */
export interface ScribingComponents {
    Tooltip: ScribingComponent<ScribingTooltipProps>;
    Button: ScribingComponent<ScribingButtonProps>;
    ImageZoom?: ScribingComponent<ScribingImageZoomProps>;
}

/** @public */
export interface ScribingTooltipProps {
    title: ReactNode;
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
    href: string | null;
    ref: (elem: HTMLElement | null) => void;
}

/** @public */
export interface ScribingImageZoomProps {
    sourceUrl: string;
    sourceWidth: number;
    sourceHeight: number;
    onClose: () => void;
}

/** @public */
export const DefaultScribingComponents: ScribingComponents = Object.freeze({
    Tooltip: ({title, children}: ScribingTooltipProps) => (
        <span title={typeof title === "string" ? title : ""}>{children}</span>
    ),
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
