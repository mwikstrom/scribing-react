import React, { createContext, FC, ReactNode, useContext } from "react";

/**
 * @internal
 */
export type AssetLoader = (url: string) => Promise<Blob | string>;

/**
 * @internal
 */
export interface AssetLoaderScopeProps {
    loader?: AssetLoader;
    children?: ReactNode;
}

/**
 * @internal
 */
export const AssetLoaderScope: FC<AssetLoaderScopeProps> = ({
    loader = DefaultAssetLoader,
    children,
}) => (
    <AssetLoaderContext.Provider
        value={loader}
        children={children}
    />
);

/**
 * @internal
 */
export function useAssetLoader(): AssetLoader {
    return useContext(AssetLoaderContext);
}

const DefaultAssetLoader: AssetLoader = async url => url;
const AssetLoaderContext = createContext<AssetLoader>(DefaultAssetLoader);
