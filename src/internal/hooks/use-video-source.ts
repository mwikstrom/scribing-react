import { useMemo } from "react";
import { VideoSource } from "scribing";
import { useFlowEditorController } from "../FlowEditorControllerScope";
import { useAssetUrl } from "./use-asset-url";
import { useBlobUrl } from "./use-blob-url";
import { useVerifiedVideoUrl, VerifiedVideo } from "./use-verified-video";
import { useVerifiedImageUrl } from "./use-verified-image";

export function useVideoSource(source: VideoSource): VerifiedVideo {
    return useVideoSourceUrl(source.url, source.upload);
}

export function useVideoPosterUrl(source: VideoSource): string | undefined {
    const { poster = "", placeholder } = source;
    const { url: posterUrl, ready: posterReady } = useVerifiedImageUrl(poster);
    if (posterReady) {
        return posterUrl;
    } else if (placeholder) {
        return `data:;base64,${placeholder}`;
    }
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
