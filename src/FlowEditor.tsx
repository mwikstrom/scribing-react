import React, { CSSProperties, FC, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { FlowEditorState, FlowOperation, FlowSelection, TextStyle } from "scribing";
import { FlowView } from "./FlowView";
import { useControllable } from "./internal/hooks/use-controlled";
import { useDocumentHasFocus } from "./internal/hooks/use-document-has-focus";
import { useNativeEventHandler } from "./internal/hooks/use-native-event-handler";
import { mapDomSelectionToFlow } from "./internal/mapping/dom-selection-to-flow";
import { mapFlowSelectionToDom } from "./internal/mapping/flow-selection-to-dom";
import { getInputHandler } from "./internal/input-handlers";
import { setupEditingHostMapping } from "./internal/mapping/flow-editing-host";
import { isEditingSupported } from "./internal/utils/is-editing-supported";

/**
 * Component props for {@link FlowEditor}
 * @public
 */
export interface FlowEditorProps {
    state?: FlowEditorState;
    defaultState?: FlowEditorState;
    autoFocus?: boolean;
    onStateChange?: (
        after: FlowEditorState,
        change: FlowOperation | null,
        before: FlowEditorState,
    ) => boolean | undefined;
}

/**
 * Flow editor component
 * @public
 */
export const FlowEditor: FC<FlowEditorProps> = props => {
    // Extract props
    const {
        state: controlledState,
        defaultState = FlowEditorState.empty,
        autoFocus,
        onStateChange,
    } = props;
    
    // Setup controlled/uncontrolled state
    const [state, setState] = useControllable({
        componentName: FlowEditor.name,
        controlledPropName: "state",
        controlledValue: controlledState,
        defaultPropName: "defaultState",
        defaultValue: defaultState,
    });

    // Determine whether editing is supported
    const editable = useMemo(isEditingSupported, []);

    // Setup ref for the editing host element
    const rootRef = useRef<HTMLDivElement | null>(null);
    const { current: editingHost } = rootRef;

    // Keep editing host mapping in sync
    useLayoutEffect(() => {
        if (editingHost) {
            setupEditingHostMapping(editingHost, state);
        }
    }, [editingHost, state]);

    // Keep track of whether the browser document is focused
    const documentHasFocus = useDocumentHasFocus();

    // Apply auto focus
    useEffect(() => {
        if (editingHost && autoFocus) {
            editingHost.focus();
        }
    }, [autoFocus, editingHost]);
    
    // Handle native "beforeinput"
    useNativeEventHandler(editingHost, "beforeinput", (event: InputEvent) => {
        const { inputType } = event;
        event.preventDefault();

        const inputHandler = getInputHandler(inputType);
        if (!inputHandler) {
            console.warn(`Unsupported input type: ${inputType}`);
            return;
        }

        // It's safe to assume that editing host is not null, because otherwise
        // this event handler wouldn't be invoked.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const operation = inputHandler(event, editingHost!, state);
        if (!operation) {
            return;
        }

        const after = state.applyMine(operation);
        if (state.equals(after)) {
            return;
        }
        
        if (onStateChange && onStateChange(after, operation, state) === false) {
            return;
        }

        setState(after);
    }, [state, editingHost, onStateChange]);

    // Handle native "selectionchange"
    useNativeEventHandler(document, "selectionchange", () => {
        const domSelection = document.getSelection();

        if (!editingHost) {
            return;
        }

        const mapped = mapDomSelectionToFlow(domSelection, editingHost);
        const changed = mapped ?
            !FlowSelection.baseType.equals(mapped, state.selection) :
            state.selection !== null;
        
        if (!changed) {
            return;
        }

        const after = state.merge({
            selection: mapped,
            caret: TextStyle.empty,
        });

        if (onStateChange && !onStateChange(after, null, state)) {
            return;
        }

        setState(after);
    }, [editingHost, state, onStateChange]);
    
    // Keep DOM selection in sync with editor selection
    useLayoutEffect(() => {
        const { activeElement } = document;
        const domSelection = document.getSelection();

        if (
            !documentHasFocus || 
            !editingHost || 
            !activeElement || 
            !editingHost.contains(activeElement) || 
            !domSelection
        ) {
            return;
        }

        const mapped = mapDomSelectionToFlow(domSelection, editingHost);
        const changed = mapped ?
            !FlowSelection.baseType.equals(mapped, state.selection) :
            state.selection !== null;
        
        if (!changed) {
            return;
        }

        mapFlowSelectionToDom(state.selection, editingHost, domSelection);
    }, [editingHost, state, documentHasFocus]);
    
    const css = useMemo((): CSSProperties => ({
        outline: "none",
    }), []);

    return (
        <div 
            ref={rootRef}
            style={css}
            contentEditable={editable}
            suppressContentEditableWarning={true}
            children={<FlowView content={state.content}/>}
        />
    );
};
