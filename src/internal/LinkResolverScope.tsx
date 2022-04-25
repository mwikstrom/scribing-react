import React, { createContext, FC, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { LinkAction, ResolveLinkEvent } from "../ResolveLinkEvent";
import { LRU } from "./utils/lru";

/**
 * @internal
 */
export interface ResolvedLink {
    action: LinkAction;
    url: string;
    target: string;
    state: unknown;
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
            return async (input: string) => {
                const args = new ResolveLinkEvent(input);
                handler(args);
                await args._complete();
                const { href: url, target, action, state } = args;
                const resolved: ResolvedLink = { url, target, action, state };
                return resolved;
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

/**
 * @internal
 */
export function resolvedLinkRequiresHtml5History(link: ResolvedLink | null | undefined): boolean {
    if (!link) {
        return false;
    } else {
        return link.action === "push" || link.action === "replace";
    }
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

const DefaultLinkResolver: LinkResolver = async url => ({
    action: "open",
    url,
    target: ResolveLinkEvent.getDefaultTarget(url),
    state: undefined,
});

const LinkResolverContext = createContext<LinkResolver>(DefaultLinkResolver);
