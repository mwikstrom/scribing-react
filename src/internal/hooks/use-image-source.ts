import { useEffect, useState } from "react";
import { ImageSource } from "scribing";

export interface ImageSourceInUse {
    url: string;
    broken: boolean;
    ready: boolean;
}

export function useImageSource(source: ImageSource): ImageSourceInUse {
    const original = useOriginalImageSource(source.url);
    const placeholder = useImageSourcePlaceholder(source.placeholder);
    if (placeholder.url && placeholder.ready && (!original.url || !original.ready)) {
        return placeholder;
    } else {
        return original;
    }
}

function useOriginalImageSource(sourceUrl: string): ImageSourceInUse {
    return useVerifiedImageUrl(sourceUrl);
}

function useImageSourcePlaceholder(placeholder: string | null | undefined): ImageSourceInUse {
    const url = placeholder ? `data:;base64,${placeholder}` : "";
    return useVerifiedImageUrl(url);
}

function useVerifiedImageUrl(unverified: string): ImageSourceInUse {
    const [url, setUrl] = useState("");
    const [broken, setBroken] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let active = true;
        
        setReady(!unverified);
        setBroken(false);

        if (unverified) {
            const img = new Image();
            img.onload = () => {
                if (active) {
                    setUrl(img.src);
                    setReady(true);
                    setBroken(false);
                }
            };
            img.onerror = () => {
                if (active) {
                    setUrl("");
                    setReady(true);
                    setBroken(true);
                }
            };
            img.src = unverified;
        }

        return () => { active = false; };
    }, [unverified]);

    return { url, broken, ready };
}