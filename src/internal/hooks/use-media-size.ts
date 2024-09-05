import { CSSProperties, useMemo } from "react";
import { useBlockSize } from "../BlockSize";
import { ImageSource, VideoSource } from "scribing";

export type MediaSize = Required<Pick<CSSProperties, "width" | "aspectRatio">>;

export function useMediaSize(source: ImageSource | VideoSource, scale: number): MediaSize {
    const blockSize = useBlockSize();
    return useMemo<MediaSize>(() => {
        const { width, height } = source;
        const css: MediaSize = {
            width: `calc(min(${blockSize}, ${Math.round(width * scale)}px))`,
            aspectRatio: `${width}/${height}`,
        };
        return css;
    }, [blockSize, source.width, source.height, scale]);
}
