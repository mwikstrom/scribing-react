export async function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onerror = () => reject(new Error("Failed to load image"));
        image.onload = () => resolve(image);
        image.src = url;
    });
}
