import { useCallback, useEffect, useState } from "react";
import { useShiftKey } from "./use-modifier-key";
import { useNativeEventHandler } from "./use-native-event-handler";

export function useIsParentSelectionActive(elem: HTMLElement | null): boolean {
    const shift = useShiftKey();
    const check = useCallback(() => {
        const selection = document.getSelection();
        
        if (!selection || !elem) {
            return false;
        }
        
        const { focusNode, anchorNode, isCollapsed } = selection;
        
        if (isCollapsed) {
            return shift && !elem.contains(anchorNode);
        }

        if (!elem.contains(focusNode) || !elem.contains(anchorNode)) {
            return true;
        }

        return false;
    }, [elem, shift]);
    const [result, setResult] = useState(check());
    const update = useCallback(() => setResult(check()), [setResult, check]);
    useEffect(update, [update]);
    useEffect(() => {
        if (result) {
            const interval = setInterval(update, 250);
            return () => clearInterval(interval);
        }
    }, [result, update]);
    useNativeEventHandler(document, "selectionchange", update, [update]);
    return result;
}