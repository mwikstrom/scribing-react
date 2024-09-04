import { useEffect, useState } from "react";
import { LRU } from "../utils/lru";

export interface VerifiedVideo {
    url: string;
    broken: boolean;
    ready: boolean;
}

export function useVerifiedVideoUrl(url: string): VerifiedVideo {
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
            const result = await verifyVideo(url);
            if (active) {
                setState(result);
            }
        })();

        return () => { active = false; };
    }, [url, state]);
    return state;
}

const verifyVideo = (url: string): Promise<VerifiedVideo> => {
    return new Promise<VerifiedVideo>(resolve => {
        const video = document.createElement("video");
        video.addEventListener("canplay", () => video.currentTime = 0);
        video.addEventListener("seeked", () => resolve(makeSuccessState(url)));
        video.addEventListener("error", () => resolve(makeBrokenState(url)));
        video.src = url;
    }).then(result => {
        VERIFICATION_CACHE.set(url, result);
        return result;
    });
};

const VERIFICATION_CACHE = new LRU<string, VerifiedVideo>(100);
const makeInitialState = (url: string): VerifiedVideo => Object.freeze({ url, broken: false, ready: false }); 
const makeBrokenState = (url: string): VerifiedVideo => Object.freeze({ url, broken: true, ready: true });
const makeSuccessState = (url: string): VerifiedVideo => Object.freeze({ url, broken: false, ready: true });
