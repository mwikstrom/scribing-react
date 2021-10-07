import React, { createContext, FC, ReactNode, useContext } from "react";

/**
 * @public
 */
export type EditMode = true | false | "inactive";

/**
 * @public
 */
export interface EditModeScopeProps {
    mode: EditMode;
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
export function useEditMode(): EditMode {
    return useContext(EditModeContext);
}

const EditModeContext = createContext<EditMode>(false);
