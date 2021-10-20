import { useCallback, useEffect, useState } from "react";
import { useNativeEventHandler } from "./use-native-event-handler";

export function useIsSelected(elem: HTMLElement | null): boolean {
    const [invalidation, setInvalidation] = useState(0);
    const check = useCallback(() => {
        const selection = document.getSelection();
        return !!selection && !!elem && selection.containsNode(elem);
    }, [elem]);
    const [result, setResult] = useState(check());
    const update = useCallback(() => setResult(check()), [setResult, check]);

    // HACK ALERT: Using an interval to check a couple of times after
    // selection is changed. This is ugly and should be fixed.
    
    useEffect(() => {
        let repeat = 8;
        const timer = setInterval(() => {
            if (--repeat >= 0) {
                update();
            } else {
                clearInterval(timer);
                repeat = 0;
            }
        }, 500);
        update();
        return () => {
            if (repeat > 0) {
                clearInterval(timer);
            }
        };
    }, [invalidation, update]);
    
    useNativeEventHandler(
        document, 
        "selectionchange", 
        () => setInvalidation(before => before + 1), 
        [setInvalidation],
    );
    
    return result;
}