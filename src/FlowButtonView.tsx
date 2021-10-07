import clsx from "clsx";
import React, { useCallback, useMemo, useState } from "react";
import { createUseStyles } from "react-jss";
import { FlowButton, FlowButtonSelection, FlowSelection, NestedFlowSelection } from "scribing";
import { flowNode } from "./FlowNodeComponent";
import { FlowView } from "./FlowView";
import { useCtrlKey } from "./internal/hooks/use-ctrl-key";
import { FlowAxis, setupFlowAxisMapping } from "./internal/mapping/flow-axis";
import { makeJssId } from "./internal/utils/make-jss-id";
import { useInteractionInvoker } from "./useInteractionInvoker";

export const FlowButtonView = flowNode<FlowButton>((props, outerRef) => {
    const { node, theme: paraTheme, ...forward } = props;
    const { content, action } = node;
    const { editMode, components } = forward;
    const { button: Component } = components;
    const theme = useMemo(() => paraTheme.getFlowTheme(), [paraTheme]);
    const classes = useStyles();
    const [hover, setHover] = useState(false);
    const ctrlKey = useCtrlKey();
    const ref = useCallback((dom: HTMLElement | null) => {
        outerRef(dom);
        if (dom) {
            setupFlowAxisMapping(dom, new FlowButtonContentAxis());
        }        
    }, [outerRef]);
    const onMouseEnter = useCallback(() => setHover(true), [setHover]);
    const onMouseLeave = useCallback(() => setHover(false), [setHover]);
    const invokeAction = useInteractionInvoker(action);
    const onClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        if (!editMode || e.ctrlKey) {
            invokeAction();
        }
    }, [editMode, invokeAction]);
    const clickable = !editMode || (hover && ctrlKey);
    return (
        <Component 
            ref={ref}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={clsx(
                classes.root,
                editMode && classes.editable,
                clickable && classes.clickable,
            )}
            children={(
                <FlowView
                    {...forward}
                    content={content}
                    theme={theme}
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
const useStyles = createUseStyles({
    root: {
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
}, {
    generateId: makeJssId("FlowButton"),
});
