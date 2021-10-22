import React, { createContext, FC, ReactNode, useContext } from "react";

/**
 * @internal
 */
export type EditMode = true | false | "inactive";

/**
 * @internal
 */
export interface EditModeScopeProps {
    mode: EditMode;
    children?: ReactNode;
}

/**
 * @internal
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
 * @internal
 */
export function useEditMode(): EditMode {
    return useContext(EditModeContext);
}

const EditModeContext = createContext<EditMode>(false);
