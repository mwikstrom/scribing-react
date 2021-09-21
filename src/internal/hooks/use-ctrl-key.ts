import { useState } from "react";
import { useNativeEventHandler } from "./use-native-event-handler";

/** @internal */
export const useCtrlKey = (): boolean => {
    const [state, setState] = useState(false);
    useNativeEventHandler(window, "keydown", (e: KeyboardEvent) => setState(e.ctrlKey), [setState]);
    useNativeEventHandler(window, "keyup", (e: KeyboardEvent) => setState(e.ctrlKey), [setState]);
    return state;
};