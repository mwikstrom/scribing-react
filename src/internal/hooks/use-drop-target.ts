import { useCallback, useEffect, useState } from "react";
import { FlowEditorCommands } from "../FlowEditorCommands";
import { getFlowContentFromDataTransfer, isImageFileTransfer } from "../utils/data-transfer";
import { fixCaretPosition } from "../utils/fix-caret-position";
import { getDomPositionFromPoint } from "../utils/get-dom-position-from-point";
import { setCaretPosition } from "../utils/set-caret-position";
import { useNativeEventHandler } from "./use-native-event-handler";

/** @internal */
export interface DropTarget {
    active: boolean;
}

/** @internal */
export function useDropTarget(editingHost: HTMLElement | null, commands: FlowEditorCommands): DropTarget {
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
            dataTransfer.dropEffect = isImageFileTransfer(dataTransfer) ? "copy" : "none";
        }
    }, [commands]);

    const handleDrop = useCallback((e: DragEvent) => {
        const { dataTransfer } = e;
        setActive(false);
        e.preventDefault();
        e.stopPropagation();
        if (editingHost) {
            editingHost.focus();
        }
        if (dataTransfer) {
            const content = getFlowContentFromDataTransfer(dataTransfer, commands);
            if (content) {
                commands.insertContentOrPromise(content);
            }
        }
    }, [commands, editingHost]);

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
