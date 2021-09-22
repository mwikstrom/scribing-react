import React, { CSSProperties, FC, useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { 
    FlowEditorState, 
    FlowOperation, 
    FlowSelection, 
    FlowTheme, 
    ParagraphStyle, 
    TargetOptions, 
    TextStyle
} from "scribing";
import { FlowView } from "./FlowView";
import { useControllable } from "./internal/hooks/use-controlled";
import { useDocumentHasFocus } from "./internal/hooks/use-document-has-focus";
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
        autoFocus,
        onStateChange,
        theme,
        components,
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
        // Tab is used to increase/decreate list level
        if (e.key === "Tab") {
            e.preventDefault();
            if (state.selection) {
                const options: TargetOptions = {
                    target: state.content,
                    theme: state.theme,
                };
                const delta = e.shiftKey ? -1 : 1;
                const operation = state.selection.incrementListLevel(options, delta);
                applyChange(operation);
            }
        }

        // CTRL + 0 to CTRL + 9 changes paragraph style variant
        if (e.key >= "0" && e.key <= "9" && e.ctrlKey) {
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
            !documentHasFocus || 
            !editingHost || 
            !activeElement || 
            !editingHost.contains(activeElement) || 
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
    }, [editingHost, state, documentHasFocus]);
    
    const classes = useStyles();
    const forwardProps = { theme, components, style };

    return (
        <div 
            {...forwardProps}
            ref={rootRef}
            className={classes.root}
            contentEditable={editable}
            suppressContentEditableWarning={true}
            onKeyDown={onKeyDown}
            children={
                <FlowView
                    content={state.content}
                    theme={theme}
                    components={components}
                    editable={editable}
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
