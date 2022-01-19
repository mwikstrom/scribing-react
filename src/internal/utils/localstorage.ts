/** @internal */
export function getLocalStorage(key: string): string | null {
    const cached = CACHE.get(key);
    if (typeof cached === "string") {
        return cached;
    }

    try {
        const stored = localStorage.getItem(key);
        if (typeof stored === "string") {
            CACHE.set(key, stored);
            return stored;
        } else {
            return null;
        }
    } catch (error) {
        warnOnce(error);
        return null;
    }
}

/** @internal */
export function setLocalStorage(key: string, value: string | null): void {
    try {
        if (typeof value === "string") {
            localStorage.setItem(key, value);
        } else {
            localStorage.removeItem(key);
        }
    } catch (error) {
        warnOnce(error);
    }    

    if (typeof value === "string") {
        CACHE.set(key, value);
    } else {
        CACHE.delete(key);
    }
}

const warnOnce = (error: unknown) => {
    if (!DID_WARN) {
        console.error("Failed to access local storage", error);
        DID_WARN = true;
    }
};

const CACHE = new Map<string, string>();
let DID_WARN = false;