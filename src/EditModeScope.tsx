import React, { createContext, FC, ReactNode, useContext } from "react";

/**
 * @public
 */
export interface EditModeScopeProps {
    mode: boolean;
    children?: ReactNode;
}

/**
 * @public
 */
export const EditModeScope: FC<EditModeScopeProps> = ({
    mode,
    children,
}) => (
    <EditModeContext.Provider
        value={mode}
        children={children}
    />
);

/**
 * @public
 */
export function useEditMode(): boolean {
    return useContext(EditModeContext);
}

const EditModeContext = createContext(false);
