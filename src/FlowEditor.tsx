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
import { applyFlowSelectionToDom } from "./internal/mapping/flow-selection-to-dom";
import { getInputHandler } from "./internal/input-handlers";
import { setupEditingHostMapping } from "./internal/mapping/flow-editing-host";
import { isEditingSupported } from "./internal/utils/is-editing-supported";
import { EditMode, EditModeScope } from "./internal/EditModeScope";
import { FormattingMarksScope } from "./internal/FormattingMarksScope";
import { useActiveElement } from "./internal/hooks/use-active-element";
import { useDocumentHasFocus } from "./internal/hooks/use-document-has-focus";
import { handleKeyEvent } from "./internal/key-handlers";
import { TooltipScope, useShowTools } from "./internal/TooltipScope";
import { TooltipManager } from "./internal/TooltipManager";
import { FlowEditorCommands } from "./internal/FlowEditorCommands";
import { getVirtualSelectionElement } from "./internal/utils/get-virtual-caret-element";
import { getLineHeight } from "./internal/utils/get-line-height";
import { isSelectionInside } from "./internal/utils/is-selection-inside";
import { getDomPositionFromPoint } from "./internal/utils/get-dom-position-from-point";
import { fixCaretPosition } from "./internal/utils/fix-caret-position";
import { setCaretPosition } from "./internal/utils/set-caret-position";
import { createUseStyles } from "react-jss";
import { makeJssId } from "./internal/utils/make-jss-id";
import { FlowCaretScope } from "./internal/FlowCaretScope";
import clsx from "clsx";
import { useDropTarget } from "./internal/hooks/use-drop-target";

/**
 * Component props for {@link FlowEditor}
 * @public
 */
export interface FlowEditorProps {
    state?: FlowEditorState;
    defaultState?: FlowEditorState;
    autoFocus?: boolean;
    style?: CSSProperties;
    nativeSelection?: boolean;
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
        nativeSelection,
        onStateChange: onStateChangeProp,
    } = props;

    // JSS classes
    const classes = useStyles();
    
    // Setup controlled/uncontrolled state
    const [state, setState] = useControllable({
        componentName: FlowEditor.name,
        controlledPropName: "state",
        controlledValue: controlledState,
        defaultPropName: "defaultState",
        defaultValue: defaultState,
    });

    // Track whether component is mounted
    const mountedRef = useRef(false);
    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    // State change handler
    const onStateChange = useCallback<Exclude<FlowEditorProps["onStateChange"], undefined>>((after, change, before) => {
        let changed = false;
        if (mountedRef.current) {
            setState(current => {
                if (current.equals(before) && !current.equals(after)) {
                    changed = true;
                    return after;
                } else {
                    return current;
                }
            });
            if (changed && onStateChangeProp) {
                onStateChangeProp(after, change, before);
            }
        }
        return changed;
    }, [onStateChangeProp, setState]);

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
            (
                editingHost === activeElement ||
                editingHost.contains(activeElement)
            )
        ) {
            return true;
        } else {
            return "inactive";
        }
    }, [activeElement, editingHost, documentHasFocus]);

    // Should we use custom selection styling?
    const customSelection = !nativeSelection && !!editMode;

    // Apply auto focus
    useEffect(() => {
        if (editingHost && autoFocus) {
            editingHost.focus();
        }
    }, [autoFocus, editingHost]);

    // Keep track of undo stack shall be merged
    const shouldMergeUndo = useRef(false);
    const stopMergeUndoTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Handle new state or operation
    const applyChange = useCallback((
        result: FlowOperation | FlowEditorState | null, 
        base: FlowEditorState,
    ): FlowEditorState => {
        const { current: mergeUndo } = shouldMergeUndo;
        let after: FlowEditorState;
        let operation: FlowOperation | null;
        let didApplyMine = false;

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
        
        onStateChange(after, operation, base);

        if (didApplyMine) {
            shouldMergeUndo.current = true;

            if (stopMergeUndoTimeout.current !== null) {
                clearTimeout(stopMergeUndoTimeout.current);
            }

            // Keep merging undo stack until input has been idle for half a second
            setTimeout(() => shouldMergeUndo.current = false, 500);
        }

        return after;
    }, [onStateChange]);

    // Keep editor commands fresh. We expose a singleton that we update with
    // current state as needed.
    const commands = useMemo(() => new FlowEditorCommands(state, applyChange), []);
    useLayoutEffect(() => commands._sync(state, applyChange), [commands, state, applyChange]);

    // Handle keyboard input
    useNativeEventHandler(
        editingHost,
        "keydown",
        (event: KeyboardEvent) => handleKeyEvent(event, commands),
        [commands]
    );

    // Handle composition events  
    useNativeEventHandler(
        editingHost,
        "compositionend",
        (event: CompositionEvent) => commands.insertText(event.data),
        [commands]
    );
    
    // Handle native "beforeinput"
    useNativeEventHandler(editingHost, "beforeinput", (event: InputEvent) => {
        const { inputType } = event;

        if (inputType === "insertCompositionText" || inputType === "deleteCompositionText") {
            return;
        }

        event.preventDefault();
        
        const inputHandler = getInputHandler(inputType);
        if (!inputHandler) {
            console.warn(`Unsupported input type: ${inputType}`, event);
            return;
        }

        inputHandler(commands, event);
    }, [commands]);

    // Keep track of DOM selection
    const [domSelectionChange, setDomSelectionChange] = useState(0);
    useNativeEventHandler(
        document, 
        "selectionchange", 
        () => setDomSelectionChange(before => before + 1),
        [],
    );
    useEffect(() => {
        if (!editingHost) {
            return;
        }

        const domSelection = document.getSelection();
        if (!isSelectionInside(editingHost, domSelection)) {
            return;
        }

        if (domSelection?.isCollapsed) {
            const { focusNode: node, focusOffset: offset } = domSelection;
            if (node) {
                const fixed = fixCaretPosition({ node, offset });
                if (fixed) {
                    setCaretPosition(fixed);
                    return;
                }
            }
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

        onStateChange(after, null, state);
    }, [domSelectionChange, editingHost, state, onStateChange]);
   
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

        applyFlowSelectionToDom(state.selection, editingHost, domSelection);
    }, [editingHost, state]); // Yes, it depends on `state` -- not just `state.selection`

    // Ensure that caret selection stays inside the scrollable viewport after content is changed
    useEffect(() => {
        const domSelection = document.getSelection();
        if (editingHost && domSelection && domSelection.isCollapsed && isSelectionInside(editingHost, domSelection)) {
            const virtualElem = getVirtualSelectionElement(domSelection);
            if (virtualElem) {
                const rect = virtualElem.getBoundingClientRect();
                if (rect.bottom > editingHost.clientHeight) {
                    editingHost.scrollTo({ top: editingHost.scrollTop + rect.bottom - editingHost.clientHeight });
                } else if (rect.top < 0) {
                    const lineHeight = getLineHeight(domSelection.focusNode);
                    editingHost.scrollTo({ top: Math.max(editingHost.scrollTop + rect.top - lineHeight, 0) });
                }
            }
        }
    }, [state.content, editingHost]);

    // Tooltip manager
    const tooltipManager = useMemo(() => new TooltipManager(), []);
    useEffect(() => {
        if (editingHost && activeElement && (editingHost === activeElement || editingHost.contains(activeElement))) {
            tooltipManager.editingHost.pub(activeElement as HTMLElement);
        } else {
            tooltipManager.editingHost.pub(null);
        }
    }, [tooltipManager, editingHost, activeElement]);

    // Show contextual toolbar
    const showTools = useShowTools(tooltipManager);
    useEffect(() => {
        const domSelection = document.getSelection();
        if (
            domSelection && 
            state.selection && 
            editingHost && 
            isSelectionInside(editingHost, domSelection, true) && 
            documentHasFocus
        ) {
            const virtualElem = getVirtualSelectionElement(domSelection);
            if (virtualElem) {
                return showTools(virtualElem, commands);
            }
        }            
    }, [editingHost, state, commands, documentHasFocus]);

    // Ensure that caret doesn't end up on the "wrong" side of a pilcrow (paragraph break)
    // when caret is moved by the cursor
    useNativeEventHandler(editingHost, "mousedown", (e: MouseEvent) => {
        const domPos = getDomPositionFromPoint(e);
        if (!domPos) {
            return;
        }

        if (e.shiftKey) {
            // Selection is extended - this is not a caret move operation
            return;
        }

        const fixed = fixCaretPosition(domPos);
        if (fixed) {
            setCaretPosition(fixed, true);
            e.preventDefault();
        }
    }, [], { capture: true });

    // Handle drop
    const { active: isActiveDropTarget } = useDropTarget(editingHost);

    return (
        <TooltipScope manager={tooltipManager} boundary={editingHost}>
            <EditModeScope mode={editMode}>
                <FormattingMarksScope show={state.formattingMarks}>
                    <FlowCaretScope
                        style={isActiveDropTarget ? TextStyle.empty : state.caret}
                        selection={state.selection}
                        native={!customSelection}
                        isDropTarget={isActiveDropTarget}
                        children={(
                            <div 
                                ref={setEditingHost}
                                className={clsx(classes.root, customSelection && classes.customSelection)}
                                style={style}
                                contentEditable={editMode !== false}
                                suppressContentEditableWarning={true}
                                children={<FlowView content={state.content} selection={state.selection}/>}
                            />
                        )}
                    />
                </FormattingMarksScope>
            </EditModeScope>
        </TooltipScope>
    );
};

const useStyles = createUseStyles({
    root: {
        outline: "none",
        padding: "0 0.75rem",
    },
    customSelection: {
        caretColor: "transparent",
        "& *::selection": {
            backgroundColor: "transparent",
        }

    },
}, {
    generateId: makeJssId("FlowEditor"),
});
