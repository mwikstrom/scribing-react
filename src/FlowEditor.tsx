import React, { FC, useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { FlowContent, FlowOperation, FlowRange } from "scribing";
import { FlowContentView } from "./FlowContentView";
import { BeforeInputEvent } from "./internal/before-input-event";
import { 
    flowRangeArrayEquals, 
    mapDomSelectionToFlowRangeArray, 
    mapFlowRangeArrayToDomSelection, 
    useRootMapping
} from "./internal/dom-mapping";
import { useBeforeInputHandler } from "./internal/use-before-input-handler";
import { useControlled } from "./internal/use-controlled";
import { useDocumentHasFocus } from "./internal/use-document-has-focus";
import { useNativeEventHandler } from "./internal/use-native-event-handler";

/**
 * Component props for {@link FlowEditor}
 * @public
 */
export interface FlowEditorProps {
    content?: FlowContent;
    defaultContent?: FlowContent;
    selection?: readonly FlowRange[];
    defaultSelection?: readonly FlowRange[];
    autoFocus?: boolean;
    onContentChange?: (content: FlowContent, operation: FlowOperation) => void;
    onSelectionChange?: (selection: readonly FlowRange[]) => void;
}

/**
 * Flow editor component
 * @public
 */
export const FlowEditor: FC<FlowEditorProps> = props => {
    const componentName = "FlowEditor";
   
    // Extract props
    const {
        content: controlledContent,
        defaultContent = new FlowContent(),
        selection: controlledSelection,
        defaultSelection = [],
        autoFocus,
        onContentChange,
        onSelectionChange,
    } = props;
    
    // Setup controlled/uncontrolled content state
    const [content, setContent] = useControlled({
        componentName,
        controlledPropName: "content",
        controlledValue: controlledContent,
        defaultPropName: "defaultContent",
        defaultValue: defaultContent,
    });

    // Setup controlled/uncontrolled selection state
    const [selection, setSelection] = useControlled({
        componentName,
        controlledPropName: "selection",
        controlledValue: controlledSelection,
        defaultPropName: "defaultSelection",
        defaultValue: defaultSelection,
    });

    // Determine whether editing is supported
    const isSupported = useMemo(() => {
        if (
            window.InputEvent && 
            typeof (InputEvent.prototype as unknown as BeforeInputEvent).getTargetRanges === "function"
        ) {
            return true;
        } else {
            console.error("Editing is not supported in your browser :-(");
            return false;
        }
    }, []);

    // Setup ref for the editing host element
    const rootRef = useRef<HTMLDivElement | null>(null);

    // Keep track of whether the browser document is focused
    const documentHasFocus = useDocumentHasFocus();

    // Register root mapping
    useRootMapping(rootRef, content);

    // Apply flow operations
    const handleOperation = useCallback((operation: FlowOperation): void => {
        const updated = operation.applyTo(content);
        setContent(updated);
        if (onContentChange) {
            onContentChange(updated, operation);
        }
    }, [content, onContentChange]);

    // Handle native "beforeinput"
    useBeforeInputHandler(rootRef, content, handleOperation);

    // Apply auto focus
    useEffect(() => {
        if (rootRef.current && autoFocus) {
            rootRef.current.focus();
        }
    }, [autoFocus, rootRef.current]);

    // Handle native "selectionchange"
    useNativeEventHandler(document, "selectionchange", () => {
        const domSelection = document.getSelection();

        if (!rootRef.current || !domSelection) {
            return;
        }
            
        const mapped = mapDomSelectionToFlowRangeArray(domSelection, rootRef.current);
        if (flowRangeArrayEquals(selection, mapped)) {
            return;
        }

        setSelection(mapped);
        if (onSelectionChange) {
            onSelectionChange(mapped);
        }
    }, [rootRef.current]);
    
    // Keep DOM selection in sync with editor selection
    useLayoutEffect(() => {
        const { activeElement } = document;
        const domSelection = document.getSelection();

        if (
            !documentHasFocus || 
            !rootRef.current || 
            !activeElement || 
            !rootRef.current.contains(activeElement) || 
            !domSelection
        ) {
            return;
        }

        const mapped = mapDomSelectionToFlowRangeArray(domSelection, rootRef.current);
        if (flowRangeArrayEquals(selection, mapped)) {
            return;            
        }

        mapFlowRangeArrayToDomSelection(selection, domSelection, rootRef.current);
    }, [documentHasFocus, rootRef.current, selection]);   
    
    // TODO: CSS class!

    return (
        <div 
            ref={rootRef}
            contentEditable={isSupported}
            suppressContentEditableWarning={true}
            children={<FlowContentView content={content}/>}
        />
    );
};
