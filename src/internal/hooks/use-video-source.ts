import { useMemo } from "react";
import { VideoSource } from "scribing";
import { useFlowEditorController } from "../FlowEditorControllerScope";
import { useAssetUrl } from "./use-asset-url";
import { useBlobUrl } from "./use-blob-url";
import { useVerifiedVideoUrl, VerifiedVideo } from "./use-verified-video";

export function useVideoSource(source: VideoSource): VerifiedVideo {
    const original = useVideoSourceUrl(source.url, source.upload);
    const placeholder = useVideoSourcePlaceholder(source.placeholder);
    if (placeholder.url && placeholder.ready && (!original.url || !original.ready)) {
        return placeholder;
    } else {
        return original;
    }
}

function useVideoSourcePlaceholder(placeholder: string | null | undefined): VerifiedVideo {
    const url = placeholder ? `data:;base64,${placeholder}` : "";
    return useVerifiedVideoUrl(url);
}

function useVideoSourceUrl(sourceUrl: string, uploadId?: string): VerifiedVideo {
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
    const verifiedUrl = useVerifiedVideoUrl(uploadUrl ?? (typeof assetUrl === "string" ? assetUrl : ""));
    if (assetUrl instanceof Error) {
        return Object.freeze({ url: sourceUrl, broken: true, ready: true });
    } else {
        return verifiedUrl;
    }
}
