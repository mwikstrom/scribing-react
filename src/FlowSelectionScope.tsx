import React, { createContext, FC, ReactNode, useContext } from "react";
import { FlowSelection } from "scribing";

/**
 * @public
 */
export interface FlowSelectionScopeProps {
    selection?: FlowSelection | null;
    children?: ReactNode;
}

/**
 * @public
 */
export const FlowSelectionScope: FC<FlowSelectionScopeProps> = ({
    selection = null,
    children,
}) => (
    <FlowSelectionContext.Provider
        value={selection}
        children={children}
    />
);

/**
 * @public
 */
export function useFlowSelection(): FlowSelection | null {
    return useContext(FlowSelectionContext);
}

const FlowSelectionContext = createContext<FlowSelection | null>(null);
