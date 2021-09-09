import { MutableRefObject } from "react";
import { FlowContent, FlowOperation, FlowRange, InsertContent, RemoveRange } from "scribing";
import { BeforeInputEvent, getInsertionContent } from "./before-input-event";
import { mapDomRangeToFlow } from "./dom-mapping";
import { useNativeEventHandler } from "./use-native-event-handler";

/** @internal */
export const useBeforeInputHandler = (
    rootRef: MutableRefObject<HTMLElement | null>,
    content: FlowContent,
    handleOperation: (operation: FlowOperation) => void,
): void => useNativeEventHandler(rootRef.current, "beforeinput", (event: BeforeInputEvent) => {
    const { inputType } = event;
    const domRanges = event.getTargetRanges();
    const flowRanges = new Array<FlowRange>();

    event.preventDefault();

    if (!rootRef.current) {
        console.warn("Cannot process input when editing host is unavailable");
        return;
    }

    for (const domRange of domRanges) {
        const mapped = mapDomRangeToFlow(domRange, rootRef.current);

        if (!mapped) {
            // tslint:disable-next-line:no-console
            console.warn("Discarding input because target DOM range could not be mapped to content");
            return;
        }

        flowRanges.push(mapped);
    }

    const operationArray: FlowOperation[] = [];
    const insertionContent = getInsertionContent(event);

    if (
        insertionContent ||
        inputType === "deleteContentBackward" ||
        inputType === "deleteContentForward" ||
        inputType === "deleteContent" ||
        inputType === "deleteByCut" ||
        inputType === "deleteByDrag"
    ) {
        const maybeFlipped = inputType === "deleteContentBackward" ? flowRanges.map(r => r.reverse()) : flowRanges;
        operationArray.push(...maybeFlipped.filter(r => !r.isCollapsed).map(r => new RemoveRange({ range: r })));
    } else {
        console.warn(`Unsupported input type: ${inputType}`);
    }

    if (insertionContent) {        
        operationArray.push(...flowRanges.map(
            r => new InsertContent({ position: r.focus, content: insertionContent }))
        );
    }

    const operation = FlowOperation.fromArray(operationArray);
    if (operation !== null) {
        handleOperation(operation);
    }
}, [rootRef.current, content, handleOperation]);