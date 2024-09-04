export const createPlaceholder = (source: HTMLImageElement | HTMLVideoElement): string | undefined => {
    const canvas = createImageCanvas(source, getPlaceholderScale);
    if (canvas) {
        return getPlaceholderData(canvas);
    }
};

export const createImageBlob = (source: HTMLImageElement | HTMLVideoElement): Promise<Blob | null> => {
    const canvas = createImageCanvas(source);
    if (canvas) {
        return new Promise(resolve => canvas.toBlob(resolve, "image/webp", 0.95));
    } else {
        return Promise.resolve(null);
    }
};

export type GetImageScale = (sourceWidth: number, sourceHeight: number) => number;

const createImageCanvas = (
    source: HTMLImageElement | HTMLVideoElement,
    scale?: GetImageScale | number,
): HTMLCanvasElement | undefined => {
    let { width, height } = source;

    if (isVideoElement(source)) {
        width = source.videoWidth;
        height = source.videoHeight;
    }

    if (typeof scale === "function") {
        scale = scale(width, height);
    }

    if (typeof scale !== "number") {
        scale = 1;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const context = canvas.getContext("2d");
    if (context) {
        context.drawImage(source, 0, 0, canvas.width, canvas.height);
        return canvas;
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

const isVideoElement = (source: HTMLElement): source is HTMLVideoElement =>
    /^video$/i.test(source.tagName);