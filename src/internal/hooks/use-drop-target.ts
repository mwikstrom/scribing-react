import { useCallback, useEffect, useState } from "react";
import { FlowEditorController } from "../../FlowEditorController";
import { getFlowContentFromDataTransfer, isMediaFileTransfer } from "../utils/data-transfer";
import { fixCaretPosition } from "../utils/fix-caret-position";
import { getDomPositionFromPoint } from "../utils/get-dom-position-from-point";
import { setCaretPosition } from "../utils/set-caret-position";
import { useNativeEventHandler } from "./use-native-event-handler";

/** @internal */
export interface DropTarget {
    active: boolean;
}

/** @internal */
export function useDropTarget(editingHost: HTMLElement | null, controller: FlowEditorController): DropTarget {
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
            dataTransfer.dropEffect = isMediaFileTransfer(dataTransfer) ? "copy" : "none";
        }
    }, [controller]);

    const handleDrop = useCallback((e: DragEvent) => {
        const { dataTransfer } = e;
        setActive(false);
        e.preventDefault();
        e.stopPropagation();
        if (editingHost) {
            editingHost.focus();
        }
        if (dataTransfer) {
            const content = getFlowContentFromDataTransfer(dataTransfer, controller);
            if (content) {
                controller.insertContentOrPromise(content);
            }
        }
    }, [controller, editingHost]);

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
