import { useState } from "react";
import { useNativeEventHandler } from "./use-native-event-handler";

/** @internal */
export const useDocumentHasFocus = (): boolean => {
    const [state, setState] = useState(document.hasFocus());
    useNativeEventHandler(window, "blur", () => setState(false), []);
    useNativeEventHandler(window, "focus", () => setState(true), []);
    return state;
};
