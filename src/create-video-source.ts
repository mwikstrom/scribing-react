import { VideoSource, VideoSourceProps } from "scribing";
import { createImageBlob, createPlaceholder } from "./create-placeholder";
import { loadImage } from "./loadImage";

/** @public */
export async function createVideoPosterFromBlob(videoBlob: Blob): Promise<Blob | null> {
    const videoUrl = URL.createObjectURL(videoBlob);
    try {
        const video = await loadVideo(videoUrl);
        return await createImageBlob(video);
    } finally {
        URL.revokeObjectURL(videoUrl);
    }
}

/** @public */
export async function createVideoSourceFromUrl(videoUrl: string, posterUrl?: string | null): Promise<VideoSource> {
    const video = await loadVideo(videoUrl);
    let placeholder: string | undefined;
    const props: VideoSourceProps = {
        width: video.videoWidth,
        height: video.videoHeight,
        url: videoUrl,
    };

    if (posterUrl) {
        const posterImage = await loadImage(posterUrl);
        placeholder = createPlaceholder(posterImage);
    } else {
        placeholder = createPlaceholder(video);
    }

    if (placeholder) {
        props.placeholder = placeholder;
    }

    return new VideoSource(props);
}

/** @public */
export async function createVideoSourceForUpload(blob: Blob, upload: string): Promise<VideoSource> {
    const url = URL.createObjectURL(blob);
    try {
        const video = await loadVideo(url);
        const props: VideoSourceProps = {
            width: video.videoWidth,
            height: video.videoHeight,
            url: "",
            upload,
        };
        const placeholder = createPlaceholder(video);
        if (placeholder) {
            props.placeholder = placeholder;
        }
        return new VideoSource(props);
    } finally {
        URL.revokeObjectURL(url);
    }
}

const loadVideo = async (url: string) => new Promise<HTMLVideoElement>((resolve, reject) => {
    const video = document.createElement("video");
    video.addEventListener("canplay", () => video.currentTime = 0);
    video.addEventListener("seeked", () => resolve(video));
    video.addEventListener("error", () => reject(new Error("Failed to load video: " + video.error?.message)));
    video.src = url;    
});
