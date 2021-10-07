import React, { CSSProperties, FC, useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { 
    FlowEditorState, 
    FlowOperation, 
    FlowSelection, 
    FlowTheme, 
    ParagraphBreak,
    ParagraphStyle, 
    TargetOptions, 
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
import { FlowNodeComponentMap } from "./FlowNodeComponent";

/**
 * Component props for {@link FlowEditor}
 * @public
 */
export interface FlowEditorProps {
    state?: FlowEditorState;
    defaultState?: FlowEditorState;
    autoFocus?: boolean;
    theme?: FlowTheme;
    components?: Partial<Readonly<FlowNodeComponentMap>>;
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
        theme,
        components,
        style,
        ...restProps
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
    const editMode = useMemo(isEditingSupported, []);

    // Setup ref for the editing host element
    const [editingHost, setEditingHost] = useState<HTMLElement | null>(null);

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
        // Handle case when moving caret right to avoid ending up after a paragraph break
        if (e.key === "ArrowRight" && state.selection && state.selection.isCollapsed) {
            const newSelection = state.selection.transformRanges((range, options = {}) => {
                const { target } = options;
                if (target) {
                    const cursor = target.peek(range.last);
                    if (cursor.node instanceof ParagraphBreak) {
                        return range.translate(1);
                    }
                }
                return null;
            }, { target: state.content });

            if (newSelection) {
                e.preventDefault();
                applyChange(state.set("selection", newSelection));
                return;
            }
        }

        // Handle case when moving caret to end to avoid ending up after a paragraph break
        if (e.key === "End" && !e.ctrlKey && !e.shiftKey && state.selection && state.selection.isCollapsed) {
            const newSelection = state.selection.transformRanges((range, options = {}) => {
                const { target } = options;
                if (target) {
                    const cursor = target.peek(range.last).findNodeForward(n => n instanceof ParagraphBreak);
                    if (cursor?.node instanceof ParagraphBreak) {
                        return range.translate(cursor.position - range.last);
                    }
                }
                return null;
            }, { target: state.content });

            if (newSelection) {
                e.preventDefault();
                applyChange(state.set("selection", newSelection));
                return;
            }
        }

        // Handle case when moving caret left to avoid ending up after a paragraph break
        if (e.key === "ArrowLeft" && state.selection && state.selection.isCollapsed) {
            const newSelection = state.selection.transformRanges((range, options = {}) => {
                const { target } = options;
                if (target) {
                    const cursor = target.peek(range.first);
                    if (cursor.offset === 0 && cursor.moveToStartOfPreviousNode()?.node instanceof ParagraphBreak) {
                        return range.translate(-1);
                    }
                }
                return null;
            }, { target: state.content });

            if (newSelection) {
                e.preventDefault();
                applyChange(state.set("selection", newSelection));
                return;
            }
        }

        // Tab is used to increase/decreate list level
        if (e.key === "Tab") {
            e.preventDefault();

            if (state.selection && !e.ctrlKey && !e.altKey) {
                const delta = e.shiftKey ? -1 : 1;
                const operation = state.selection.incrementListLevel(state.content, delta);
                applyChange(operation);
            }
            
            return;
        }

        // CTRL + 0 to CTRL + 9 changes paragraph style variant
        if (e.key >= "0" && e.key <= "9" && e.ctrlKey && !e.shiftKey && !e.altKey) {
            e.preventDefault();
            if (state.selection) {
                const variant = ([
                    "normal",   // CTRL + 0
                    "h1",       // CTRL + 1
                    "h2",       // CTRL + 2
                    "h3",       // CTRL + 3
                    "h4",       // CTRL + 4
                    "h5",       // CTRL + 5
                    "h6",       // CTRL + 6
                    "title",    // CTRL + 7
                    "code",     // CTRL + 8
                    "preamble", // CTRL + 9
                ] as const)[e.key.charCodeAt(0) - "0".charCodeAt(0)];
                const options: TargetOptions = {
                    target: state.content,
                    theme: state.theme,
                };
                const style = ParagraphStyle.empty.set("variant", variant);
                const operation = state.selection.formatParagraph(style, options);
                applyChange(operation);
            }

            return;
        }

        // ALT + 0 to ALT + 9 changes list marker kind
        if (e.key >= "0" && e.key <= "9" && !e.ctrlKey && !e.shiftKey && e.altKey) {
            e.preventDefault();
            if (state.selection) {
                const kind = ([
                    "unordered",    // ALT + SHIFT + 0
                    "ordered",      // ALT + SHIFT + 1
                    "decimal",      // ALT + SHIFT + 2
                    "lower-alpha",  // ALT + SHIFT + 3
                    "upper-alpha",  // ALT + SHIFT + 4
                    "lower-roman",  // ALT + SHIFT + 5
                    "upper-roman",  // ALT + SHIFT + 6
                    "disc",         // ALT + SHIFT + 7
                    "circle",       // ALT + SHIFT + 8
                    "square",       // ALT + SHIFT + 9
                ] as const)[e.key.charCodeAt(0) - "0".charCodeAt(0)];
                const options: TargetOptions = {
                    target: state.content,
                    theme: state.theme,
                };
                const style = ParagraphStyle.empty.set("listMarker", kind);
                const operation = state.selection.formatParagraph(style, options);
                applyChange(operation);
            }

            return;
        }

        // CTRL + SHIFT + 8 toggles formatting marks (just like in Word)
        if (e.code === "Digit8" && e.ctrlKey && e.shiftKey && !e.altKey) {
            e.preventDefault();
            applyChange(state.toggleFormattingMarks());
            return;
        }

        // CTRL + Z undoes last operation
        if (e.code === "KeyZ" && e.ctrlKey && !e.shiftKey && !e.altKey) {
            e.preventDefault();
            applyChange(state.undo());
            return;
        }

        // CTRL + Y redoes last undone operation
        if (e.code === "KeyY" && e.ctrlKey && !e.shiftKey && !e.altKey) {
            e.preventDefault();
            applyChange(state.redo());
            return;
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
        const { activeElement } = document;
        const domSelection = document.getSelection();

        if (
            !editingHost || 
            !activeElement || 
            !activeElement.contains(editingHost) || 
            !domSelection
        ) {
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
    }, [editingHost, state, document.activeElement]);
    
    const classes = useStyles();
    const forwardProps = { theme, components, style };

    return (
        <div 
            {...forwardProps}
            ref={setEditingHost}
            className={classes.root}
            contentEditable={editMode}
            suppressContentEditableWarning={true}
            onKeyDown={onKeyDown}
            children={
                <FlowView
                    {...restProps}
                    content={state.content}
                    theme={theme}
                    components={components}
                    editMode={editMode}
                    formattingMarks={state.formattingMarks}
                />
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
