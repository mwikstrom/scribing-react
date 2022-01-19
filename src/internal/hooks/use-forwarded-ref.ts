import { ForwardedRef, useCallback } from "react";

/** @internal */
export const useForwardedRef = (
    ref: ForwardedRef<HTMLElement>
): ((elem: HTMLElement | null) => void) => useCallback((elem: HTMLElement | null) => {
    if (typeof ref === "function") {
        ref(elem);
    } else if (ref !== null) {
        ref.current = elem;
    }
}, [ref]);
