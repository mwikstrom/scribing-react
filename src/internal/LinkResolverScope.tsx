import React, { createContext, FC, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { ResolveLinkEvent } from "../ResolveLinkEvent";
import { LRU } from "./utils/lru";

/**
 * @internal
 */
export interface ResolvedLink {
    url: string;
    target: string;
}

/**
 * @internal
 */
export type LinkResolver = (url: string) => Promise<ResolvedLink>;


/**
 * @internal
 */
export interface LinkResolverScopeProps {
    handler?: (event: ResolveLinkEvent) => void;
    children?: ReactNode;
}

/**
 * @internal
 */
export const LinkResolverScope: FC<LinkResolverScopeProps> = ({
    handler,
    children,
}) => {
    const resolver = useMemo<LinkResolver>(() => {
        if (!handler) {
            return DefaultLinkResolver;
        } else {
            return async (url: string) => {
                const args = new ResolveLinkEvent(url, DEFAULT_TARGET);
                handler(args);
                await args._complete();
                return { url: args.href, target: args.target };
            };
        }
    }, [handler]);
    return (
        <LinkResolverContext.Provider
            value={resolver}
            children={children}
        />
    );
};

/**
 * @internal
 */
export function useLinkResolver(): LinkResolver {
    return useContext(LinkResolverContext);
}

/**
 * @internal
 */
export function useResolvedLink(url: string): ResolvedLink | null {
    const resolver = useLinkResolver();
    const cache = useMemo(() => {
        let result = CACHE.get(resolver);
        if (!result) {
            CACHE.set(resolver, result = new LRU(50));
        }
        return result;
    }, [resolver]);
    const [result, setResult] = useState(() => cache.get(url) ?? null);
    useEffect(() => setResult(cache.get(url) ?? null), [url, cache]);
    useEffect(() => {
        if (result === null && url) {
            let active = true;
            (async () => {
                const result = await resolveLinkIgnoreCache(url, resolver);
                if (active) {
                    setResult(result);
                }
            })();
            return () => { active = false; };
        }
    }, [result, resolver, url]);
    return result;
}

/**
 * @internal
 */
export async function resolveLink(url: string, resolver: LinkResolver): Promise<ResolvedLink> {
    const cache = CACHE.get(resolver);
    let result = cache?.get(url);
    if (!result) {
        result = await resolveLinkIgnoreCache(url, resolver);
    }
    return result;
}

const resolveLinkIgnoreCache = (url: string, resolver: LinkResolver): Promise<ResolvedLink> => {
    let pending = PENDING.get(resolver);
    if (!pending) {
        PENDING.set(resolver, pending = new Map());
    }
    let promise = pending.get(url);
    if (!promise) {
        pending.set(url, promise = (async () => {
            try {
                const result = await resolver(url);
                CACHE.get(resolver)?.set(url, result);
                return result;
            } finally {
                pending.delete(url);
            }
        })());

    }
    return promise;
};


const PENDING = new WeakMap<LinkResolver, Map<string, Promise<ResolvedLink>>>();
const CACHE = new WeakMap<LinkResolver, LRU<string, ResolvedLink>>();
const DEFAULT_TARGET = "_blank";

const DefaultLinkResolver: LinkResolver = async url => ({ url, target: DEFAULT_TARGET });
const LinkResolverContext = createContext<LinkResolver>(DefaultLinkResolver);
