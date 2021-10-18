import clsx from "clsx";
import React, { useCallback, useEffect, useState } from "react";
import {
    FlowButton, 
    FlowButtonSelection, 
    FlowSelection, 
    NestedFlowSelection 
} from "scribing";
import { useEditMode } from "./EditModeScope";
import { useFlowComponentMap } from "./FlowComponentMapScope";
import { useFlowLocale } from "./FlowLocaleScope";
import { flowNode } from "./FlowNodeComponent";
import { FlowView } from "./FlowView";
import { useCtrlKey } from "./internal/hooks/use-ctrl-key";
import { createUseFlowStyles } from "./internal/JssTheming";
import { FlowAxis, setupFlowAxisMapping } from "./internal/mapping/flow-axis";
import { useShowTip } from "./internal/TooltipScope";
import { useInteractionInvoker } from "./useInteractionInvoker";

export const FlowButtonView = flowNode<FlowButton>((props, outerRef) => {
    const { node } = props;
    const { content, action } = node;
    const { button: Component } = useFlowComponentMap();
    const classes = useStyles();
    const [hover, setHover] = useState(false);
    const ctrlKey = useCtrlKey();
    
    const [rootElem, setRootElem] = useState<HTMLElement | null>(null);
    const ref = useCallback((dom: HTMLElement | null) => {
        outerRef(dom);
        setRootElem(dom);
        if (dom) {
            setupFlowAxisMapping(dom, new FlowButtonContentAxis());
        }        
    }, [outerRef]);

    const onMouseEnter = useCallback(() => setHover(true), [setHover]);
    const onMouseLeave = useCallback(() => setHover(false), [setHover]);
    
    const editMode = useEditMode();
    const clickable = !editMode || (hover && ctrlKey);
    const invokeAction = useInteractionInvoker(action);
    const [pending, setPending] = useState<Promise<void> | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const onClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        if (clickable) {
            setError(null);
            setPending(invokeAction());
        }
    }, [clickable, invokeAction]);

    const showTip = useShowTip();
    const locale = useFlowLocale();

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                await pending;
            } catch (error) {
                if (active) {
                    setError(error instanceof Error ? error : new Error("Interaction failed"));
                }
            }
            if (active) {
                setPending(null);
            }
        })();
        return () => { active = false; };
    }, [pending]);
    
    useEffect(() => {
        if (editMode && !clickable && rootElem && hover) {
            return showTip(rootElem, locale.hold_ctrl_key_to_enable_interaction);
        }
    }, [!!editMode, clickable, rootElem, hover, locale]);


    useEffect(() => {
        if (error && rootElem && hover) {
            return showTip(rootElem, error.message);
        }
    }, [error, rootElem, hover, locale]);

    return (
        <Component 
            ref={ref}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={clsx(
                classes.root,
                clickable ? classes.clickable : !!editMode && classes.editable,
                pending && classes.pending,
                error && classes.error,
            )}
            disabled={!!pending}
            contentEditable={false}
            children={(
                <span
                    contentEditable={!!editMode && !clickable}
                    suppressContentEditableWarning={true}
                    className={classes.content}
                    children={<FlowView content={content}/>}
                />
            )}
        />
    );
});

class FlowButtonContentAxis extends FlowAxis {
    equals(other: FlowAxis): boolean {
        return other instanceof FlowButtonContentAxis;
    }

    createNestedSelection(
        outerPosition: number,
        innerSelection: FlowSelection,
    ): NestedFlowSelection {
        return new FlowButtonSelection({
            position: outerPosition,
            content: innerSelection,
        });
    }

    getInnerSelection(outer: NestedFlowSelection): FlowSelection | null {
        if (outer instanceof FlowButtonSelection) {
            return outer.content;
        } else {
            return null;
        }
    }
}

// TODO: FIX !important rules -- should be part of theme?
const useStyles = createUseFlowStyles("FlowButton", ({palette}) => ({
    root: {},
    content: {
        outline: "none",
        "&>.ScribingParagraph-root:first-child": {
            marginTop: "0 !important",
        },
        "&>.ScribingParagraph-root:last-child": {
            marginBottom: "0 !important",
        },
    },
    editable: {
        cursor: "text",
    },
    clickable: {
        cursor: "pointer",
    },
    pending: {
        cursor: "wait",
    },
    error: {
        outlineStyle: "dashed",
        outlineWidth: 1,
        outlineColor: palette.error,
        outlineOffset: "0.2rem",
    },
}));
