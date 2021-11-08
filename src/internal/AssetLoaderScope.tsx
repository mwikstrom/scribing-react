import React, { createContext, FC, ReactNode, useContext, useMemo } from "react";
import { LoadAssetEvent } from "../LoadAssetEvent";

/**
 * @internal
 */
export type AssetLoader = (url: string) => Promise<Blob | string>;

/**
 * @internal
 */
export interface AssetLoaderScopeProps {
    handler?: (event: LoadAssetEvent) => void;
    children?: ReactNode;
}

/**
 * @internal
 */
export const AssetLoaderScope: FC<AssetLoaderScopeProps> = ({
    handler,
    children,
}) => {
    const loader = useMemo<AssetLoader>(() => {
        if (!handler) {
            return DefaultAssetLoader;
        } else {
            return async (url: string) => {
                const args = new LoadAssetEvent(url);                
                handler(args);
                await args._complete();
                return args.blob ?? args.url;
            };
        }
    }, [handler]);
    return (
        <AssetLoaderContext.Provider
            value={loader}
            children={children}
        />
    );
};

/**
 * @internal
 */
export function useAssetLoader(): AssetLoader {
    return useContext(AssetLoaderContext);
}

const DefaultAssetLoader: AssetLoader = async url => url;
const AssetLoaderContext = createContext<AssetLoader>(DefaultAssetLoader);
