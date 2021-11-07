import { useEffect, useState } from "react";
import { LRU } from "../utils/lru";

export interface VerifiedImage {
    url: string;
    broken: boolean;
    ready: boolean;
}

export function useVerifiedImageUrl(url: string): VerifiedImage {
    const [state, setState] = useState(() => (
        VERIFICATION_CACHE.get(url) ?? 
        (url ? makeInitialState(url) : makeBrokenState(url))
    ));
    useEffect(() => {
        if (state.url === url && state.ready) {
            return;
        } else if (state.url !== url || state.ready || state.broken) {
            setState(makeInitialState(url));
        }

        let active = true;
        (async () => {
            const result = await verifyImage(url);
            if (active) {
                setState(result);
            }
        })();

        return () => { active = false; };
    }, [url, state]);
    return state;
}

const verifyImage = (url: string): Promise<VerifiedImage> => {
    return new Promise<VerifiedImage>(resolve => {
        const img = new Image();
        img.onload = () => resolve(makeSuccessState(url));
        img.onerror = () => resolve(makeBrokenState(url));
        img.src = url;
    }).then(result => {
        VERIFICATION_CACHE.set(url, result);
        return result;
    });
};

const VERIFICATION_CACHE = new LRU<string, VerifiedImage>(100);
const makeInitialState = (url: string): VerifiedImage => Object.freeze({ url, broken: false, ready: false }); 
const makeBrokenState = (url: string): VerifiedImage => Object.freeze({ url, broken: true, ready: true });
const makeSuccessState = (url: string): VerifiedImage => Object.freeze({ url, broken: false, ready: true });
