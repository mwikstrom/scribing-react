export const createPlaceholder = (source: HTMLImageElement | HTMLVideoElement): string | undefined => {
    let { width, height } = source;

    if (isVideoElement(source)) {
        width = source.videoWidth;
        height = source.videoHeight;
    }

    const scale = getPlaceholderScale(width, height);
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const context = canvas.getContext("2d");
    if (context) {
        context.drawImage(source, 0, 0, canvas.width, canvas.height);
        return getPlaceholderData(canvas);
    }
};

const MAX_PLACEHOLDER_PIXELS = 256;
const getPlaceholderScale = (width: number, height: number) => Math.min(
    1, 
    Math.sqrt(MAX_PLACEHOLDER_PIXELS / (width * height))
);

const getPlaceholderData = (canvas: HTMLCanvasElement) => {
    const dataUrl = canvas.toDataURL("video/webp", 0.05);
    const needle = ";base64,";
    const index = dataUrl.indexOf(needle);
    if (index > 0) {
        return dataUrl.substr(index + needle.length);
    }
};

const isVideoElement = (source: HTMLElement): source is HTMLVideoElement =>
    /^video$/i.test(source.tagName);