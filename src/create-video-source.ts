import { VideoSource, VideoSourceProps } from "scribing";
import { createPlaceholder } from "./create-placeholder";

/** @public */
export function createVideoSource(blob: Blob, upload: string): Promise<VideoSource>;

/** @public */
export function createVideoSource(existingUrl: string): Promise<VideoSource>;

/** @public */
export function createVideoSource(
    blobOrUrl: Blob | string,
    upload?: string
): Promise<VideoSource> {
    if (typeof blobOrUrl === "string") {
        return createVideoSourceFromUrl(blobOrUrl);
    } else if (typeof upload !== "string") {
        throw new TypeError("An upload operation identifier must be specified");
    } else {
        return createUploadVideoSource(blobOrUrl, upload);
    }
}

const createVideoSourceFromUrl = async (url: string): Promise<VideoSource> => {
    const video = await loadVideo(url);
    const placeholder = createPlaceholder(video);
    const props: VideoSourceProps = {
        width: video.width,
        height: video.height,
        url,
    };
    if (placeholder) {
        props.placeholder = placeholder;
    }
    return new VideoSource(props);
};

const createUploadVideoSource = async (blob: Blob, upload: string): Promise<VideoSource> => {
    const url = URL.createObjectURL(blob);
    try {
        const video = await loadVideo(url);
        const props: VideoSourceProps = {
            width: video.width,
            height: video.height,
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
};

const loadVideo = async (url: string) => new Promise<HTMLVideoElement>((resolve, reject) => {
    const video = document.createElement("video");
    video.onerror = () => reject(new Error("Failed to load video"));
    video.onload = () => resolve(video);
    video.src = url;
});
