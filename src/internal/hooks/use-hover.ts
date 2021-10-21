import { useState } from "react";
import { useNativeEventHandler } from "./use-native-event-handler";

/** @internal */
export function useHover(elem: HTMLElement | null): boolean {
    const [hover, setHover] = useState(false);
    useNativeEventHandler(elem, "mouseenter", () => setHover(true), []);
    useNativeEventHandler(elem, "mouseleave", () => setHover(false), []);
    return hover;
}
