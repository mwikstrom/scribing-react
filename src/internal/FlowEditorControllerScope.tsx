import React, { createContext, FC, ReactNode, useContext } from "react";
import { FlowEditorController } from "../FlowEditorController";

/**
 * @internal
 */
export interface FlowEditorControllerScopeProps {
    controller?: FlowEditorController;
    children?: ReactNode;
}

/**
 * @internal
 */
export const FlowEditorControllerScope: FC<FlowEditorControllerScopeProps> = ({
    controller: commands = null,
    children,
}) => (
    <FlowEditorControllerContext.Provider
        value={commands}
        children={children}
    />
);

/**
 * @internal
 */
export function useFlowEditorController(): FlowEditorController | null {
    return useContext(FlowEditorControllerContext);
}

const FlowEditorControllerContext = createContext<FlowEditorController | null>(null);