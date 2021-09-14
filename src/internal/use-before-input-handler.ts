import { MutableRefObject } from "react";
import { 
    FlowBatch, 
    FlowContent, 
    FlowOperation, 
    FlowRange, 
    FormatText, 
    InsertContent, 
    RemoveRange, 
    TextStyle, 
    TextStyleProps 
} from "scribing";
import { BeforeInputEvent, getContentFromInputEvent } from "./before-input-event";
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
            console.warn("Discarding input because target DOM range could not be mapped to content");
            return;
        }

        flowRanges.push(mapped);
    }

    const handler = INPUT_HANDLERS[inputType];

    if (!handler) {
        console.warn(`Unsupported input type: ${inputType}`);
        return;
    }

    const operation = handler(flowRanges, event, content);

    if (operation !== null) {
        handleOperation(operation);
    }
}, [rootRef.current, content, handleOperation]);

type InputHandler = (selection: FlowRange[], event: BeforeInputEvent, content: FlowContent) => FlowOperation | null;

const genericInsertHandler: InputHandler = (selection, event) => {
    const content = getContentFromInputEvent(event);
    if (content === null) {
        return null;
    } else {
        return insertContent(selection, content);
    }
};

const genericRemoveHandler: InputHandler = selection => FlowBatch.fromArray(
    selection.filter(range => !range.isCollapsed).map(range => new RemoveRange({ range })),
);

const deleteContentBackward: InputHandler = (selection, ...rest) => genericRemoveHandler(
    selection.map(range => range.reverse()),
    ...rest
);

const makeTextStyleToggle = (key: keyof TextStyleProps): InputHandler => (selection, _, content) => FlowBatch.fromArray(
    selection.map(range => {
        // TODO: Need support for ambient style
        const current = content.peek(range.focus).getTextStyle() ?? TextStyle.empty;
        if (current.get(key) === true) {
            return new FormatText({ range, style: TextStyle.empty.set(key, false) });
        } else {
            return new FormatText({ range, style: TextStyle.empty.set(key, true) });
        }
    })
);

const INPUT_HANDLERS: Record<string, InputHandler> = {
    deleteContentBackward,
    deleteContentForward: genericRemoveHandler,
    deleteContent: genericRemoveHandler,
    // TODO: deleteByCut: genericRemoveHandler,
    // TODO: deleteByDrag: genericRemoveHandler,
    formatBold: makeTextStyleToggle("bold"),
    formatItalic: makeTextStyleToggle("italic"),
    formatUnderline: makeTextStyleToggle("underline"),
    formatStrikeThrough: makeTextStyleToggle("strike"),
    insertCompositionText: genericInsertHandler,
    insertFromComposition: genericInsertHandler,
    insertFromDrop: genericInsertHandler,
    insertFromPaste: genericInsertHandler,
    // TODO: insertFromPasteAsQuotation: genericInsertHandler,
    insertFromYank: genericInsertHandler,
    insertLineBreak: genericInsertHandler,
    insertParagraph: genericInsertHandler,
    insertReplacementText: genericInsertHandler,
    insertText: genericInsertHandler,
    insertTranspose: genericInsertHandler,
};

const insertContent = (selection: readonly FlowRange[], content: FlowContent) => FlowBatch.fromArray([
    ...selection.filter(range => !range.isCollapsed).map(range => new RemoveRange({ range })),
    ...selection.map(range => new InsertContent({ position: range.first, content: content })),
]);
