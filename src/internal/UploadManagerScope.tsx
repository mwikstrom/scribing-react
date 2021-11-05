import React, { createContext, FC, ReactNode, useContext } from "react";
import { TransientUploadManager } from "./TransientUploadManager";
import { UploadManager } from "./UploadManager";

/**
 * @internal
 */
export interface UploadManagerScopeProps {
    manager?: UploadManager;
    children?: ReactNode;
}

/**
 * @internal
 */
export const UploadManagerScope: FC<UploadManagerScopeProps> = ({
    manager = TransientUploadManager.instance,
    children,
}) => (
    <UploadManagerContext.Provider
        value={manager}
        children={children}
    />
);

/**
 * @internal
 */
export function useUploadManager(): UploadManager {
    return useContext(UploadManagerContext);
}

const UploadManagerContext = createContext<UploadManager>(TransientUploadManager.instance);