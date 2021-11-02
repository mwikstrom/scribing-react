import { useNativeEventHandler } from "./use-native-event-handler";

export function useTransparentMouseWheel(
    transparent: HTMLElement | null,
    boundary: HTMLElement | null | undefined,
): void {
    useNativeEventHandler(transparent, "wheel", (e: WheelEvent) => {
        let { deltaX, deltaY } = e;
        if (boundary) {
            if (transparent) {
                if (
                    (deltaY < 0 && transparent.scrollTop > 0) ||
                    (deltaY > 0 && transparent.scrollHeight - transparent.clientHeight > transparent.scrollTop)
                ) {
                    deltaY = 0;
                }               

                if (
                    (deltaX < 0 && transparent.scrollLeft > 0) ||
                    (deltaX > 0 && transparent.scrollWidth > transparent.scrollLeft)
                ) {
                    deltaX = 0;
                }                
            }

            if (deltaX !== 0 || deltaY !== 0) {
                const { scrollTop, scrollLeft } = boundary;
                boundary.scrollTo({
                    top: scrollTop + deltaY,
                    left: scrollLeft + deltaX,
                });
            }

            e.stopPropagation();
        }
    }, [boundary], {
        passive: true,
    });
}
