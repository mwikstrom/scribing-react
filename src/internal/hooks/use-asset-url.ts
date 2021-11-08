import { useEffect, useMemo, useState } from "react";
import { AssetLoader, useAssetLoader } from "../AssetLoaderScope";
import { LRU } from "../utils/lru";
import { useBlobUrl } from "./use-blob-url";

export const useAssetUrl = (url: string): string | null | Error => {
    const loader = useAssetLoader();
    const cache = useMemo(() => {
        let result = CACHE.get(loader);
        if (!result) {
            CACHE.set(loader, result = new LRU(50));
        }
        return result;
    }, [loader]);
    const [asset, setAsset] = useState(() => cache.get(url) ?? null);
    useEffect(() => setAsset(cache.get(url) ?? null), [url, cache]);
    useEffect(() => {
        if (asset === null && url) {
            let active = true;
            (async () => {
                const result = await loadAsset(url, loader);
                if (active) {
                    setAsset(result);
                }
            })();
            return () => { active = false; };
        }
    }, [asset, loader, url]);
    const blobUrl = useBlobUrl(asset instanceof Blob ? asset : null);
    return url === "" ? url : asset instanceof Blob ? blobUrl : asset;
};

const loadAsset = (url: string, loader: AssetLoader): Promise<string | Blob | Error> => {
    let pending = PENDING.get(loader);
    if (!pending) {
        PENDING.set(loader, pending = new Map());
    }
    let promise = pending.get(url);
    if (!promise) {
        pending.set(url, promise = (async () => {
            try {
                const result = await loader(url);
                CACHE.get(loader)?.set(url, result);
                return result;
            } catch (error) {
                if (error instanceof Error) {
                    return error;
                } else {
                    return new Error("Failed to load asset");
                }
            } finally {
                pending.delete(url);
            }
        })());

    }
    return promise;
};

const PENDING = new WeakMap<AssetLoader, Map<string, Promise<string | Blob | Error>>>();
const CACHE = new WeakMap<AssetLoader, LRU<string, string | Blob | Error>>();
