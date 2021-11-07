import { useEffect, useMemo, useState } from "react";
import { ImageSource } from "scribing";
import { useAssetLoader } from "../AssetLoaderScope";
import { useFlowEditorCommands } from "../FlowEditorCommandsScope";

export interface ImageSourceInUse {
    url: string;
    broken: boolean;
    ready: boolean;
}

export function useImageSource(source: ImageSource): ImageSourceInUse {
    const original = useImageSourceUrl(source.url, source.upload);
    const placeholder = useImageSourcePlaceholder(source.placeholder);
    if (placeholder.url && placeholder.ready && (!original.url || !original.ready)) {
        return placeholder;
    } else {
        return original;
    }
}

function useImageSourceUrl(sourceUrl: string, uploadId?: string): ImageSourceInUse {
    const assetLoader = useAssetLoader();
    const [blobUrl, setBlobUrl] = useState("");
    const [broken, setBroken] = useState(false);
    const [unverifiedUrl, setUnverifiedUrl] = useState("");
    const verified = useVerifiedImageUrl(unverifiedUrl);
    const commands = useFlowEditorCommands();
    const upload = useMemo(() => uploadId ? commands?.getUpload(uploadId) : null, [commands, uploadId]);
    
    useEffect(() => {
        if (upload) {
            const createdUrl = URL.createObjectURL(upload);
            setBroken(false);
            setBlobUrl(createdUrl);
            setUnverifiedUrl(createdUrl);
        } else if (sourceUrl) {
            let active = true;
            setBroken(false);
            setBlobUrl("");
            setUnverifiedUrl("");
            assetLoader(sourceUrl).then(
                blob => {
                    if (active) {
                        if (blob) {
                            const createdUrl = URL.createObjectURL(blob);
                            setBlobUrl(createdUrl);
                            setUnverifiedUrl(createdUrl);
                        } else {
                            setUnverifiedUrl(sourceUrl);
                        }
                    }
                },
                () => {
                    if (active) {
                        setBroken(true);
                    }
                }
            );
            return () => { active = false; };
        }
    }, [upload, sourceUrl, assetLoader]);
    
    useEffect(() => {
        const revokeUrl = blobUrl;
        if (revokeUrl) {
            return () => URL.revokeObjectURL(revokeUrl);
        }
    }, [blobUrl]);

    if (broken) {
        return { broken, ready: true, url: sourceUrl };
    } else if (!unverifiedUrl && sourceUrl) {
        return { broken: false, ready: false, url: "" };
    } else {
        return verified;
    }
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