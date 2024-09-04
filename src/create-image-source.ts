import { ImageSource, ImageSourceProps } from "scribing";
import { createPlaceholder } from "./create-placeholder";

/** @public */
export function createImageSource(blob: Blob, upload: string): Promise<ImageSource>;

/** @public */
export function createImageSource(existingUrl: string): Promise<ImageSource>;

/** @public */
export function createImageSource(
    blobOrUrl: Blob | string,
    upload?: string
): Promise<ImageSource> {
    if (typeof blobOrUrl === "string") {
        return createImageSourceFromUrl(blobOrUrl);
    } else if (typeof upload !== "string") {
        throw new TypeError("An upload operation identifier must be specified");
    } else {
        return createUploadImageSource(blobOrUrl, upload);
    }
}

const createImageSourceFromUrl = async (url: string): Promise<ImageSource> => {
    const image = await loadImage(url);
    const placeholder = createPlaceholder(image);
    const props: ImageSourceProps = {
        width: image.width,
        height: image.height,
        url,
    };
    if (placeholder) {
        props.placeholder = placeholder;
    }
    return new ImageSource(props);
};

const createUploadImageSource = async (blob: Blob, upload: string): Promise<ImageSource> => {
    const url = URL.createObjectURL(blob);
    try {
        const image = await loadImage(url);
        const props: ImageSourceProps = {
            width: image.width,
            height: image.height,
            url: "",
            upload,
        };
        const placeholder = createPlaceholder(image);
        if (placeholder) {
            props.placeholder = placeholder;
        }
        return new ImageSource(props);
    } finally {
        URL.revokeObjectURL(url);
    }
};

const loadImage = async (url: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onerror = () => reject(new Error("Failed to load image"));
    image.onload = () => resolve(image);
    image.src = url;
});
