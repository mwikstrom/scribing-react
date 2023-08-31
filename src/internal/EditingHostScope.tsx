import React, { createContext, FC, ReactNode, useContext } from "react";

/**
 * @internal
 */
export interface EditingHostScopeProps {
    host: HTMLElement | null;
    children?: ReactNode;
}

/**
 * @internal
 */
export const EditingHostScope: FC<EditingHostScopeProps> = ({
    host,
    children,
}) => (
    <EditingHostContext.Provider value={host} children={children} />
);

/**
 * @internal
 */
export function useEditingHost(): HTMLElement | null {
    return useContext(EditingHostContext);
}

const EditingHostContext = createContext<HTMLElement | null>(null);
