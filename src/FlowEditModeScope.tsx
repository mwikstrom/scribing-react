import React, { createContext, FC, ReactNode, useContext } from "react";

/**
 * @public
 */
export interface FlowEditModeScopeProps {
    mode: boolean;
    children?: ReactNode;
}

/**
 * @public
 */
export const FlowEditModeScope: FC<FlowEditModeScopeProps> = ({
    mode,
    children,
}) => (
    <FlowEditModeContext.Provider
        value={mode}
        children={children}
    />
);

/**
 * @public
 */
export function useFlowEditMode(): boolean {
    return useContext(FlowEditModeContext);
}

const FlowEditModeContext = createContext(false);
