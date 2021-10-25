import { useState } from "react";
import { useNativeEventHandler } from "./use-native-event-handler";

/** @internal */
export const useActiveElement = (): Element | null => {
    const [activeElement, setActiveElement] = useState(document.activeElement);
    useNativeEventHandler(window, "focus", () => setActiveElement(document.activeElement), [], { capture: true });
    return activeElement;
};
