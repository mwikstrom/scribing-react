import { useCallback, useLayoutEffect } from "react";

/** @internal */
export const useNativeEventHandler = <Args extends [...unknown[]]>(
    target: EventTarget | null,
    type: string,
    handler: (...args: Args) => void,
    dependencies: unknown[]
): void => {
    const callback = useCallback(handler, dependencies) as unknown as EventListener;
    useLayoutEffect(() => {
        if (target) {
            target.addEventListener(type, callback);
            return () => target.removeEventListener(type, callback);
        }
    });
};
