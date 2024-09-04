export const createPlaceholder = (source: HTMLImageElement | HTMLVideoElement): string | undefined => {
    const scale = getPlaceholderScale(source.width, source.height);
    const canvas = document.createElement("canvas");
    canvas.width = source.width * scale;
    canvas.height = source.height * scale;
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
