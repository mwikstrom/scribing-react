import React, { createContext, FC, ReactNode, useContext } from "react";
import { FlowEditorCommands } from "../FlowEditorCommands";

/**
 * @internal
 */
export interface FlowEditorCommandsScopeProps {
    commands?: FlowEditorCommands;
    children?: ReactNode;
}

/**
 * @internal
 */
export const FlowEditorCommandsScope: FC<FlowEditorCommandsScopeProps> = ({
    commands = null,
    children,
}) => (
    <FlowEditorCommandsContext.Provider
        value={commands}
        children={children}
    />
);

/**
 * @internal
 */
export function useFlowEditorCommands(): FlowEditorCommands | null {
    return useContext(FlowEditorCommandsContext);
}

const FlowEditorCommandsContext = createContext<FlowEditorCommands | null>(null);