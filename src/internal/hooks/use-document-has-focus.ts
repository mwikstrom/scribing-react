import { useState } from "react";
import { useNativeEventHandler } from "./use-native-event-handler";

/** @internal */
export const useDocumentHasFocus = (): boolean => {
    const [state, setState] = useState(document.hasFocus());
    useNativeEventHandler(window, "blur", () => setState(document.hasFocus()), []);
    useNativeEventHandler(window, "focus", () => setState(document.hasFocus()), []);
    return state;
};
