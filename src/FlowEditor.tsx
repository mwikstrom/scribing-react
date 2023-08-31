import React, { CSSProperties, FC, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { FlowContent, FlowOperation, FlowSelection, FlowTableSelection, TextStyle } from "scribing";
import { FlowView, FlowViewProps } from "./FlowView";
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
import { FlowEditorController } from "./FlowEditorController";
import { getVirtualSelectionElement } from "./internal/utils/get-virtual-caret-element";
import { getLineHeight } from "./internal/utils/get-line-height";
import { isSelectionInside } from "./internal/utils/is-selection-inside";
import { getDomPositionFromPoint } from "./internal/utils/get-dom-position-from-point";
import { fixCaretPosition } from "./internal/utils/fix-caret-position";
import { setCaretPosition, setFocusPosition } from "./internal/utils/set-caret-position";
import { createUseStyles } from "react-jss";
import { makeJssId } from "./internal/utils/make-jss-id";
import { FlowCaretScope } from "./internal/FlowCaretScope";
import clsx from "clsx";
import { useDropTarget } from "./internal/hooks/use-drop-target";
import { FlowEditorControllerScope } from "./internal/FlowEditorControllerScope";
import { StoreAssetEvent } from "./StoreAssetEvent";
import { StateChangeEvent } from "./StateChangeEvent";
import { FlowEditorState } from "./FlowEditorState";
import { applyTextConversion } from "./internal/text-conversion";
import { RenderMarkupTagEvent } from "./RenderMarkupTagEvent";
import { MarkupTagRenderScope } from "./internal/MarkupTagRenderScope";
import { isInsideBreakOut } from "./internal/utils/break-out";

/**
 * Component props for {@link FlowEditor}
 * @public
 */
export interface FlowEditorProps extends Omit<FlowViewProps, "content" | "theme" | "selection" | "children"> {
    state?: FlowEditorState;
    defaultState?: FlowEditorState;
    autoFocus?: boolean;
    className?: string;
    style?: CSSProperties;

    /**
     * FOR DEBUGGING PURPOSES ONLY
     * @internal
     */
    nativeSelection?: boolean;

    onStateChange?: (event: StateChangeEvent) => void;

    onStoreAsset?: (event: StoreAssetEvent) => void;

    onControllerChange?: (controller: FlowEditorController | null) => void;

    onRenderMarkupTag?: (event: RenderMarkupTagEvent) => void;
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
        className,
        style,
        nativeSelection,
        onStateChange: onStateChangeProp,
        onStoreAsset,
        onControllerChange,
        onRenderMarkupTag,
        ...viewProps
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
    const stateRef = useRef(state);
    useLayoutEffect(() => {
        stateRef.current = state;
    }, [state]);
    const onStateChange = useCallback((
        after: FlowEditorState,
        change: FlowOperation | null,
        before: FlowEditorState
    ) => {
        if (!stateRef.current.equals(before)) {
            return false;
        }
        if (mountedRef.current) {
            setState(after);
            if (onStateChangeProp) {
                const event = new StateChangeEvent(before, change, after);
                onStateChangeProp(event);
                if (event.rejected) {
                    return false;
                }
            }
        }
        stateRef.current = after;
        return true;
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
        if (!isEditingSupported() || state.preview) {
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
    }, [activeElement, editingHost, documentHasFocus, state.preview]);

    // Should we use custom selection styling?
    const customSelection = !nativeSelection && !!editMode && !isInsideBreakOut(editingHost, activeElement);

    // Apply auto focus
    useEffect(() => {
        if (editingHost && autoFocus && !state.preview) {
            // Hack: Chrome/Edge freezes (tab unresponsive) when auto focus is applied on a
            // flow view document that starts with a dynamic text node. I don't understand why
            // and I can't debug it further (since the tab is unresponsive). The hack I'm going
            // to try is to defer applying auto focus for half a second. If it works, I'll just
            // keep it this way and if it doesn't I guess I'll have to come up with another hack...
            const hack_timerId = setTimeout(() => editingHost.focus(), 500);
            return () => clearTimeout(hack_timerId);
        }
    }, [autoFocus, editingHost, state.preview]);

    // Keep track of undo stack shall be merged
    const shouldMergeUndo = useRef(false);
    const stopMergeUndoTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Handle new state or operation
    const applyChange = useCallback((
        update: FlowOperation | FlowEditorState | StateChangeEvent | null, 
        base: FlowEditorState,
    ): FlowEditorState => {
        const { current: mergeUndo } = shouldMergeUndo;
        let after: FlowEditorState;
        let operation: FlowOperation | null;
        let didApplyMine = false;

        if (update instanceof FlowOperation && !state.preview) {
            operation = update;
            after = base.applyMine(operation, { mergeUndo });
            didApplyMine = true;
        } else if (FlowEditorState.classType.test(update)) {
            operation = null;
            after = update;
        } else if (update instanceof StateChangeEvent) {
            operation = update.change;
            after = update.after;
            if (!base.equals(update.before)) {
                console.warn("Rejecting update: Inconsistent base snapshot");
                return base;
            }
        } else {
            operation = null;
            after = base;
        }

        if (!onStateChange(after, operation, base)) {
            return base;
        }

        if (didApplyMine) {
            shouldMergeUndo.current = true;

            if (stopMergeUndoTimeout.current !== null) {
                clearTimeout(stopMergeUndoTimeout.current);
            }

            // Keep merging undo stack until input has been idle for half a second
            setTimeout(() => shouldMergeUndo.current = false, 500);
        }

        return after;
    }, [onStateChange, state.preview]);

    // Keep editor controller fresh. We expose a singleton that we update with
    // current state as needed.
    const controller = useMemo(() => new FlowEditorController(state, applyChange, onStoreAsset), []);
    useLayoutEffect(
        () => controller._sync(state, applyChange, onStoreAsset),
        [controller, state, applyChange, onStoreAsset]
    );

    // Notify parent of controller
    useEffect(() =>  {
        const handler = onControllerChange;
        if (handler) {
            handler(controller);
            const dispose = controller._observe(handler);
            return () => {
                dispose();
                handler(null);
            };
        }
    }, [controller, onControllerChange]);

    // Handle keyboard input
    useNativeEventHandler(
        editingHost,
        "keydown",
        (event: KeyboardEvent) => {
            if (!isInsideBreakOut(editingHost, event.target)) {
                handleKeyEvent(event, controller);
            }
        },
        [controller]
    );

    // Handle composition events  
    useNativeEventHandler(
        editingHost,
        "compositionend",
        (event: CompositionEvent) => controller.insertText(event.data),
        [controller]
    );
    
    // Handle native "beforeinput"
    useNativeEventHandler(editingHost, "beforeinput", (event: InputEvent) => {
        const { inputType } = event;

        if (inputType === "insertCompositionText" || inputType === "deleteCompositionText") {
            return;
        }

        if (isInsideBreakOut(editingHost, event.target)) {
            return;
        }

        event.preventDefault();
        
        const inputHandler = getInputHandler(inputType);
        if (!inputHandler) {
            console.warn(`Unsupported input type: ${inputType}`, event);
            return;
        }

        inputHandler(controller, event);

        if (inputType === "insertText" && typeof event.data === "string") {
            applyTextConversion(controller, event.data);
        }
    }, [controller]);

    // Keep track of DOM selection
    const [domSelectionChange, setDomSelectionChange] = useState(0);
    useNativeEventHandler(
        document, 
        "selectionchange", 
        () => setDomSelectionChange(before => before + 1),
        [],
    );
    useEffect(() => {
        // Table selection cannot be mapped to DOM so we'll ignore DOM selection
        // changes while we're in "table selection mode".
        if (!editingHost || state.selection instanceof FlowTableSelection) {
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

        if (!editingHost || !domSelection || !isSelectionInside(editingHost, domSelection)) {
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

    // Ensure that caret doesn't end up on the "wrong" side of a pilcrow (paragraph break)
    // when caret is moved by mouse
    useNativeEventHandler(editingHost, "mousedown", (e: MouseEvent) => {
        const domPos = getDomPositionFromPoint(e);
        if (!domPos) {
            return;
        }

        // Exit table selection mode if needed
        if (!e.shiftKey && state.selection instanceof FlowTableSelection) {
            applyChange(state.set("selection", null), state);
        }

        const fixed = fixCaretPosition(domPos);
        if (fixed) {
            if (e.shiftKey) {
                setFocusPosition(fixed, true);
            } else {
                setCaretPosition(fixed, true);
            }
            e.preventDefault();
        }
    }, [state, applyChange, editingHost], { capture: true });

    // Handle drop
    const { active: isActiveDropTarget } = useDropTarget(editingHost, controller);

    // Handle copy
    useNativeEventHandler(editingHost, "copy", (e: ClipboardEvent) => {
        const data = controller.copyJsonString();
        e.preventDefault();
        if (data) {
            e.clipboardData?.setData(FlowContent.jsonMimeType, data);
        }
    }, [controller]);

    // Handle cut
    useNativeEventHandler(editingHost, "cut", (e: ClipboardEvent) => {
        const data = controller.copyJsonString();
        e.preventDefault();
        if (data) {
            e.clipboardData?.setData(FlowContent.jsonMimeType, data);
            controller.remove();
        }
    }, [controller]);

    return (
        <FlowEditorControllerScope controller={controller}>
            <EditModeScope mode={editMode}>
                <FormattingMarksScope show={!state.preview && state.formattingMarks}>
                    <MarkupTagRenderScope handler={onRenderMarkupTag}>
                        <FlowCaretScope
                            style={isActiveDropTarget ? TextStyle.empty : state.caret}
                            selection={state.selection}
                            native={!customSelection}
                            isDropTarget={isActiveDropTarget}
                            children={(
                                <div 
                                    ref={setEditingHost}
                                    className={clsx(
                                        classes.root,
                                        customSelection && classes.customSelection,
                                        className
                                    )}
                                    style={style}
                                    contentEditable={editMode !== false}
                                    suppressContentEditableWarning={true}
                                    children={(
                                        <FlowView
                                            {...viewProps}
                                            content={state.content}
                                            theme={state.theme}
                                            selection={state.selection}
                                        />
                                    )}
                                />
                            )}
                        />
                    </MarkupTagRenderScope>
                </FormattingMarksScope>
            </EditModeScope>
        </FlowEditorControllerScope>
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
