import React, { CSSProperties, FC, useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
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
import { TipsAndToolsScope } from "./internal/TipsAndTools";

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
        onStateChange,
        autoFocus,
        style,
    } = props;
    
    // Setup controlled/uncontrolled state
    const [state, setState] = useControllable({
        componentName: FlowEditor.name,
        controlledPropName: "state",
        controlledValue: controlledState,
        defaultPropName: "defaultState",
        defaultValue: defaultState,
    });

    // Setup ref for the editing host element
    const [editingHost, setEditingHost] = useState<HTMLElement | null>(null);

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

    // Keep editing host mapping in sync
    useLayoutEffect(() => {
        if (editingHost) {
            setupEditingHostMapping(editingHost, state);
        }
    }, [editingHost, state]);

    // Apply auto focus
    useEffect(() => {
        if (editingHost && autoFocus) {
            editingHost.focus();
        }
    }, [autoFocus, editingHost]);

    // Handle new state or operation
    const applyChange = useCallback((result: FlowOperation | FlowEditorState | null) => {
        let after: FlowEditorState;
        let operation: FlowOperation | null;

        if (result instanceof FlowOperation) {
            operation = result;
            after = state.applyMine(operation);
        } else if (result instanceof FlowEditorState) {
            operation = null;
            after = result;
        } else {
            return;
        }

        if (state.equals(after)) {
            return;
        }
        
        if (onStateChange) {
            onStateChange(after, operation, state);
        }

        setState(after);
    }, [state, onStateChange]);

    // Handle keyboard input
    const onKeyDown = useCallback((e: React.KeyboardEvent) => {
        const result = handleKeyEvent(e, state);
        if (result) {
            applyChange(result);
        }
    }, [state]);
    
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
        const result = inputHandler(event, editingHost!, state);
        applyChange(result);
    }, [state, editingHost, applyChange]);

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
    }, [editingHost, state]);
    
    const classes = useStyles();

    return (
        <div 
            ref={setEditingHost}
            className={classes.root}
            style={style}
            contentEditable={editMode !== false}
            suppressContentEditableWarning={true}
            onKeyDown={onKeyDown}
            children={
                <TipsAndToolsScope>
                    <EditModeScope mode={editMode}>
                        <FormattingMarksScope show={state.formattingMarks}>
                            <FlowView content={state.content}/>
                        </FormattingMarksScope>
                    </EditModeScope>
                </TipsAndToolsScope>
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
