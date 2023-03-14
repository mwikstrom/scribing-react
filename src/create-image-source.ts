import { ImageSource, ImageSourceProps } from "scribing";

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

const createPlaceholder = (image: HTMLImageElement): string | undefined => {
    const scale = getPlaceholderScale(image.width, image.height);
    const canvas = document.createElement("canvas");
    canvas.width = image.width * scale;
    canvas.height = image.height * scale;
    const context = canvas.getContext("2d");
    if (context) {
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        return getPlaceholderData(canvas);
    }
};

const MAX_PLACEHOLDER_PIXELS = 256;
const getPlaceholderScale = (width: number, height: number) => Math.min(
    1, 
    Math.sqrt(MAX_PLACEHOLDER_PIXELS / (width * height))
);

const getPlaceholderData = (canvas: HTMLCanvasElement) => {
    const dataUrl = canvas.toDataURL("image/webp", 0.05);
    const needle = ";base64,";
    const index = dataUrl.indexOf(needle);
    if (index > 0) {
        return dataUrl.substr(index + needle.length);
    }
};
