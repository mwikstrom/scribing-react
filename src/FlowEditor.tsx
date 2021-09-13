import React, { CSSProperties, FC, useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { FlowContent, FlowOperation, FlowRange, ParagraphBreak } from "scribing";
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
    onChange?: (
        newContent: FlowContent, 
        newSelection: readonly FlowRange[],
        operation: FlowOperation | null, 
        oldContent: FlowContent,
        oldSelection: readonly FlowRange[]
    ) => boolean | undefined;
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
        defaultContent = getDefaultContent(),
        selection: controlledSelection,
        defaultSelection = [],
        autoFocus,
        onChange,
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
    const handleOperation = useCallback((operation: FlowOperation): boolean => {
        const newContent = operation.applyToContent(content);
        const newSelection: FlowRange[] = [];
        
        for (const range of selection) {
            const updated = operation.updateSelection(range, true);
            if (updated !== null) {
                newSelection.push(updated);
            }
        }

        if (onChange && onChange(newContent, newSelection, operation, content, selection) === false) {
            return false;
        }

        setContent(newContent);
        setSelection(newSelection);
        
        return true;
    }, [content, selection, onChange]);

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

        if (!onChange || onChange(content, mapped, null, content, selection) !== false) {
            setSelection(mapped);
        }
    }, [rootRef.current, onChange, content, selection]);
    
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
    
    const css = useMemo((): CSSProperties => ({
        outline: "none",
    }), []);

    return (
        <div 
            ref={rootRef}
            style={css}
            contentEditable={isSupported}
            suppressContentEditableWarning={true}
            children={<FlowContentView content={content}/>}
        />
    );
};

const getDefaultContent = (): FlowContent => {
    if (!DEFAULT_CONTENT) {
        DEFAULT_CONTENT = new FlowContent({
            nodes: Object.freeze([
                new ParagraphBreak(),
            ])
        });
    }
    return DEFAULT_CONTENT;
};

let DEFAULT_CONTENT: FlowContent | undefined;
