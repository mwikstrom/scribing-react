import { useEffect, useState } from "react";
import { ImageSource } from "scribing";

export function useImageSource(source: ImageSource): { url: string, broken: boolean, ready: boolean } {
    const [url, setUrl] = useState("");
    const [broken, setBroken] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const { url: sourceUrl, placeholder } = source;
        let active = true;
        let sourceDone = false;
        
        setUrl("");
        setReady(false);
        setBroken(false);

        if (placeholder) {
            const img = new Image();
            img.onload = () => {
                if (active && !sourceDone) {
                    setUrl(img.src);
                    setReady(true);
                }
            };
            img.src = `data:;base64,${placeholder}`;
        }

        if (sourceUrl) {
            const img = new Image();
            img.onload = () => {
                sourceDone = true;
                if (active) {
                    setUrl(img.src);
                    setReady(true);
                }
            };
            img.onerror = () => {
                sourceDone = true;
                if (active) {
                    setUrl("");
                    setBroken(true);
                    setReady(true);
                }
            };
            img.src = sourceUrl;
        } else {
            setReady(true);
        }

        return () => { active = sourceDone = false; };
    }, [source]);

    return { url, broken, ready };
}
