import { useMemo } from "react";
import { VideoSource } from "scribing";
import { useFlowEditorController } from "../FlowEditorControllerScope";
import { useAssetUrl } from "./use-asset-url";
import { useBlobUrl } from "./use-blob-url";

export function useVideoSourceUrl(source: VideoSource): string {
    return useVideoSourceCore(source.url, source.upload);
}

function useVideoSourceCore(sourceUrl: string, uploadId?: string): string {
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
    if (uploadUrl) {
        return uploadUrl;
    } else if (assetUrl instanceof Error) {
        return "";
    } else {
        return assetUrl ?? "";
    }
}
