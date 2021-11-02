import { useNativeEventHandler } from "./use-native-event-handler";

export function useTransparentMouseWheel(
    transparent: HTMLElement | null,
    boundary: HTMLElement | null | undefined,
): void {
    useNativeEventHandler(transparent, "wheel", (e: WheelEvent) => {
        let { deltaX, deltaY } = e;
        if (boundary) {
            for (const element of document.elementsFromPoint(e.clientX, e.clientY)) {
                if (element === boundary || element.contains(boundary)) {
                    continue;
                }

                if (element !== transparent && !transparent?.contains(element)) {
                    continue;
                }

                const { overflowX, overflowY } = getComputedStyle(element);                                

                if (
                    (overflowY === "scroll" || overflowY === "auto") && (
                        (deltaY < 0 && element.scrollTop > 0) ||
                        (deltaY > 0 && element.scrollHeight - element.clientHeight > element.scrollTop)
                    )
                ) {
                    deltaY = 0;
                }               

                if (
                    (overflowX === "scroll" || overflowX === "auto") && (
                        (deltaX < 0 && element.scrollLeft > 0) ||
                        (deltaX > 0 && element.scrollWidth > element.scrollLeft)
                    )
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
