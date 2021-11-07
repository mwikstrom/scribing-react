import { useEffect, useMemo } from "react";

export const useBlobUrl = (blob: Blob | null): string | null => {
    const entry = useMemo(() => {
        if (blob === null) {
            return null;
        }
        let result = CACHE.get(blob);
        if (!result) {
            CACHE.set(blob, result = new BlobUrlCacheEntry(blob));
        }
        return result;
    }, [blob]);
    useEffect(() => {
        if (entry) {
            return entry.keepAlive();
        }
    }, [entry]);
    return entry?.url ?? null;
};

const CACHE = new WeakMap<Blob, BlobUrlCacheEntry>();

class BlobUrlCacheEntry {
    readonly #blob: Blob;
    #url: string | null = null;
    #refCount = 0;
    #cleanupTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(blob: Blob) {
        this.#blob = blob;
    }

    get url(): string {
        if (this.#url === null) {
            this.#url = URL.createObjectURL(this.#blob);
            this.#triggerCleanup();
        }
        return this.#url;
    }

    keepAlive(): () => void {
        let active = true;
        this.#addRef();
        return () => {
            if (active) {
                this.#removeRef();
                active = false;
            }
        };
    }

    #addRef(): void {
        ++this.#refCount;
        this.#cancelCleanup();
    }

    #removeRef(): void {
        --this.#refCount;
        this.#triggerCleanup();
    }

    #triggerCleanup() {
        this.#cancelCleanup();
        if (this.#refCount <= 0) {
            this.#cleanupTimer = setTimeout(() => {
                if (this.#url) {
                    URL.revokeObjectURL(this.#url);
                    this.#url = null;
                }
            }, 1000);
        }
    }

    #cancelCleanup() {
        if (this.#cleanupTimer !== null) {
            clearTimeout(this.#cleanupTimer);
            this.#cleanupTimer = null;
        }
    }
}
