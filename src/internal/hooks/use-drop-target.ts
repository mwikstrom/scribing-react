import { useCallback, useEffect, useState } from "react";
import { fixCaretPosition } from "../utils/fix-caret-position";
import { getDomPositionFromPoint } from "../utils/get-dom-position-from-point";
import { setCaretPosition } from "../utils/set-caret-position";
import { useNativeEventHandler } from "./use-native-event-handler";

/** @internal */
export interface DropTarget {
    active: boolean;
}

/** @internal */
export function useDropTarget(editingHost: HTMLElement | null): DropTarget {
    const [active, setActive] = useState(false);
    const [leaving, setLeaving] = useState(false);

    const handleDrag = useCallback((e: DragEvent) => {
        const { dataTransfer } = e;
        setActive(true);
        setLeaving(false);
        setCaretPositionFromDragEvent(e);
        e.preventDefault();
        e.stopPropagation();
        if (dataTransfer) {
            dataTransfer.dropEffect = hasImageFile(dataTransfer) ? "copy" : "none";
        }
    }, []);

    const handleDrop = useCallback((e: DragEvent) => {
        setActive(false);
        e.preventDefault();
        e.stopPropagation();
    }, []);

    useEffect(() => {
        if (active && leaving) {
            const timer = setTimeout(() => setActive(false), 100);
            return () => clearTimeout(timer);
        }
    }, [active, leaving]);

    useNativeEventHandler(editingHost, "dragenter", handleDrag, [handleDrag]);
    useNativeEventHandler(editingHost, "dragleave", () => setLeaving(true), [setLeaving]);    
    useNativeEventHandler(editingHost, "dragover", handleDrag, [handleDrag]);
    useNativeEventHandler(editingHost, "drop", handleDrop, [handleDrop]);

    return { active };
}

const setCaretPositionFromDragEvent = (e: DragEvent) => {
    const domPos = getDomPositionFromPoint(e);
    if (!domPos) {
        return;
    }

    const fixed = fixCaretPosition(domPos);
    setCaretPosition(fixed ?? domPos);
};

const hasImageFile = (dataTransfer: DataTransfer): boolean => {
    for (let i = 0; i < dataTransfer.items.length; ++i) {
        const item = dataTransfer.items[i];
        if (item.kind === "file" && /^image\//.test(item.type)) {
            return true;
        }
    }
    return false;
};
