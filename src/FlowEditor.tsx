import React, { CSSProperties, FC, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { 
    FlowEditorState, 
    FlowOperation, 
    FlowSelection, 
    TextStyle
} from "scribing";
import { FlowView } from "./FlowView";
import { useControllable } from "./internal/hooks/use-controlled";
import { useNativeEventHandler } from "./internal/hooks/use-native-event-handler";
import { mapDomSelectionToFlow } from "./internal/mapping/dom-selection-to-flow";
import { mapFlowSelectionToDom } from "./internal/mapping/flow-selection-to-dom";
import { getInputHandler } from "./internal/input-handlers";
import { setupEditingHostMapping } from "./internal/mapping/flow-editing-host";
import { isEditingSupported } from "./internal/utils/is-editing-supported";
import { createUseStyles } from "react-jss";
import { makeJssId } from "./internal/utils/make-jss-id";
import { EditMode, EditModeScope } from "./EditModeScope";
import { FormattingMarksScope } from "./FormattingMarksScope";
import { useActiveElement } from "./internal/hooks/use-active-element";
import { useDocumentHasFocus } from "./internal/hooks/use-document-has-focus";
import { handleKeyEvent } from "./internal/key-handlers";
import { TooltipScope, useShowTools } from "./internal/TooltipScope";
import { PendingOperation } from "./internal/input-handlers/PendingOperation";
import { TooltipManager } from "./internal/TooltipManager";

/**
 * Component props for {@link FlowEditor}
 * @public
 */
export interface FlowEditorProps {
    state?: FlowEditorState;
    defaultState?: FlowEditorState;
    autoFocus?: boolean;
    style?: CSSProperties;
    onStateChange?: (
        after: FlowEditorState,
        change: FlowOperation | null,
        before: FlowEditorState,
    ) => void;
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
        style,
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

    // Keep track of editing host element
    const [editingHost, setEditingHostCore] = useState<HTMLElement | null>(null);
    const setEditingHost = useCallback((elem: HTMLElement | null) => {
        setEditingHostCore(elem);
        if (elem) {
            setupEditingHostMapping(elem, state);
        }
    }, [setEditingHostCore]);

    // Keep track of the currently active element
    const activeElement = useActiveElement();
    const documentHasFocus = useDocumentHasFocus();

    // Determine whether editing is supported
    const editMode = useMemo<EditMode>(() => {
        if (!isEditingSupported()) {
            return false;
        } else if (
            editingHost && 
            activeElement && 
            documentHasFocus &&
            activeElement.contains(editingHost)
        ) {
            return true;
        } else {
            return "inactive";
        }
    }, [activeElement, editingHost, documentHasFocus]);

    // Apply auto focus
    useEffect(() => {
        if (editingHost && autoFocus) {
            editingHost.focus();
        }
    }, [autoFocus, editingHost]);

    // Keep track of pending operation
    const pendingOperation = useRef<PendingOperation | null>(null);
    const completePendingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Keep track of undo stack shall be merged
    const shouldMergeUndo = useRef(false);
    const stopMergeUndoTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Handle new state or operation
    const applyChange = useCallback((result: FlowOperation | FlowEditorState | null) => {
        const { current: mergeUndo } = shouldMergeUndo;
        let base = state;
        let after: FlowEditorState;
        let operation: FlowOperation | null;
        let didApplyMine = false;

        if (pendingOperation.current !== null) {
            const complete = pendingOperation.current.complete(state, editingHost);            
            if (complete !== null) {
                base = base.applyMine(complete, { mergeUndo });
                didApplyMine = true;
            }

            pendingOperation.current = null;
            if (completePendingTimeout.current !== null) {
                clearTimeout(completePendingTimeout.current);
            }
        }

        if (result instanceof FlowOperation) {
            operation = result;
            after = base.applyMine(operation, { mergeUndo });
            didApplyMine = true;
        } else if (result instanceof FlowEditorState) {
            operation = null;
            after = result;
        } else {
            operation = null;
            after = base;
        }

        if (state.equals(after)) {
            return;
        }
        
        if (onStateChange) {
            onStateChange(after, operation, state);
        }

        setState(after);

        if (didApplyMine) {
            shouldMergeUndo.current = true;

            if (stopMergeUndoTimeout.current !== null) {
                clearTimeout(stopMergeUndoTimeout.current);
            }

            // Keep merging undo stack until input has been idle for half a second
            setTimeout(() => shouldMergeUndo.current = false, 500);
        }
    }, [state, editingHost, onStateChange]);

    // Handle keyboard input
    useNativeEventHandler(editingHost, "keydown", (event: KeyboardEvent) => {
        const result = handleKeyEvent(event, state);
        if (result) {
            applyChange(result);
        }
    }, [state]);
    
    // Handle native "beforeinput"
    useNativeEventHandler(editingHost, "beforeinput", (event: InputEvent) => {
        const { inputType } = event;

        try {
            const inputHandler = getInputHandler(inputType);
            if (!inputHandler) {
                console.warn(`Unsupported input type: ${inputType}`);
                return;
            }

            // It's safe to assume that editing host is not null, because otherwise
            // this event handler wouldn't be invoked.
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const result = inputHandler(event, editingHost!, state, pendingOperation.current);

            if (result instanceof PendingOperation) {
                pendingOperation.current = result;

                if (completePendingTimeout.current !== null) {
                    clearTimeout(completePendingTimeout.current);
                }

                completePendingTimeout.current = setTimeout(() => applyChange(null), 500);
            } else {
                event.preventDefault();
                applyChange(result);
            }
        } catch (err) {
            event.preventDefault();
            console.error("Input handler threw exception:", err);
        }
    }, [state, editingHost, applyChange]);

    // Handle native "selectionchange"
    useNativeEventHandler(document, "selectionchange", () => {
        if (!editingHost || pendingOperation.current !== null) {
            return;
        }

        const domSelection = document.getSelection();
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

        if (onStateChange) {
            onStateChange(after, null, state);
        }

        setState(after);
    }, [editingHost, state, onStateChange]);
    
    // Keep DOM selection in sync with editor selection
    useLayoutEffect(() => {
        const domSelection = document.getSelection();

        if (!editingHost || !domSelection) {
            return;
        }

        const mapped = mapDomSelectionToFlow(domSelection, editingHost);
        const different = mapped ?
            !FlowSelection.baseType.equals(mapped, state.selection) :
            state.selection !== null;
        
        if (!different) {
            return;
        }

        mapFlowSelectionToDom(state.selection, editingHost, domSelection);
    }, [editingHost, state.selection]);

    // Tooltip manager
    const tooltipManager = useMemo(() => new TooltipManager(), []);

    // Show contextual toolbar
    const showTools = useShowTools(tooltipManager);
    useEffect(() => {
        const domSelection = document.getSelection();
        if (domSelection && domSelection.rangeCount === 1 && state.selection && documentHasFocus) {
            const range = domSelection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            if (rect.height > 0 || rect.width > 0) {
                return showTools(range, state.selection);
            }
        }            
    }, [state.selection, documentHasFocus]);

    const classes = useStyles();
    return (
        <div 
            ref={setEditingHost}
            className={classes.root}
            style={style}
            contentEditable={editMode !== false}
            suppressContentEditableWarning={true}
            children={
                <TooltipScope manager={tooltipManager}>
                    <EditModeScope mode={editMode}>
                        <FormattingMarksScope show={state.formattingMarks}>
                            <FlowView content={state.content}/>
                        </FormattingMarksScope>
                    </EditModeScope>
                </TooltipScope>
            }
        />
    );
};

const useStyles = createUseStyles({
    root: {
        outline: "none",
        padding: "0 0.75rem",
    },
}, {
    generateId: makeJssId("FlowEditor"),
});
