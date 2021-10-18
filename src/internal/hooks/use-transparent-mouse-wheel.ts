import { useNativeEventHandler } from "./use-native-event-handler";

export function useTransparentMouseWheel(
    transparent: HTMLElement | null,
    boundary: HTMLElement | null | undefined,
): void {
    useNativeEventHandler(transparent, "wheel", (e: WheelEvent) => {
        const { deltaX, deltaY } = e;
        if (boundary) {
            const { scrollTop, scrollLeft } = boundary;
            boundary.scrollTo({
                top: scrollTop + deltaY,
                left: scrollLeft + deltaX,
            });
        }
    }, [boundary]);
}
