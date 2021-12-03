import { useMemo } from "react";
import { ImageSource } from "scribing";
import { useFlowEditorController } from "../FlowEditorControllerScope";
import { useAssetUrl } from "./use-asset-url";
import { useBlobUrl } from "./use-blob-url";
import { useVerifiedImageUrl, VerifiedImage } from "./use-verified-image";

export function useImageSource(source: ImageSource): VerifiedImage {
    const original = useImageSourceUrl(source.url, source.upload);
    const placeholder = useImageSourcePlaceholder(source.placeholder);
    if (placeholder.url && placeholder.ready && (!original.url || !original.ready)) {
        return placeholder;
    } else {
        return original;
    }
}

function useImageSourcePlaceholder(placeholder: string | null | undefined): VerifiedImage {
    const url = placeholder ? `data:;base64,${placeholder}` : "";
    return useVerifiedImageUrl(url);
}

function useImageSourceUrl(sourceUrl: string, uploadId?: string): VerifiedImage {
    const controller = useFlowEditorController();
    const uploadBlob = useMemo(() => {
        if (uploadId && controller) {
            return controller.getUpload(uploadId);
        } else {
            return null;
        }
    }, [controller, uploadId]);
    const uploadUrl = useBlobUrl(uploadBlob);
    const assetUrl = useAssetUrl(sourceUrl);
    const verifiedUrl = useVerifiedImageUrl(uploadUrl ?? (typeof assetUrl === "string" ? assetUrl : ""));
    if (assetUrl instanceof Error) {
        return Object.freeze({ url: sourceUrl, broken: true, ready: true });
    } else {
        return verifiedUrl;
    }
}
