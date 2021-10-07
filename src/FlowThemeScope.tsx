import React, { createContext, FC, ReactNode, useContext } from "react";
import { DefaultFlowTheme, FlowTheme } from "scribing";

/**
 * @public
 */
export interface FlowThemeScopeProps {
    theme?: FlowTheme;
    children?: ReactNode;
}

/**
 * @public
 */
export const FlowThemeScope: FC<FlowThemeScopeProps> = ({
    theme = DefaultFlowTheme.instance,
    children,
}) => (
    <FlowThemeContext.Provider
        value={theme}
        children={children}
    />
);

/**
 * @public
 */
export function useFlowTheme(): FlowTheme {
    return useContext(FlowThemeContext);
}

const FlowThemeContext = createContext<FlowTheme>(DefaultFlowTheme.instance);