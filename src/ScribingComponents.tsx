import React, { createContext, FC, ReactNode, useContext } from "react";

/** @public */
export type ScribingComponent<P> = (props: P) => JSX.Element;

/** @public */
export interface ScribingComponents {
    Tooltip: ScribingComponent<ScribingTooltipProps>;
}

/** @public */
export interface ScribingTooltipProps {
    title: string | null;
    children: ReactNode;
}

/** @public */
export const DefaultScribingComponents: ScribingComponents = Object.freeze({
    Tooltip: ({children}) => <>{children}</>,
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