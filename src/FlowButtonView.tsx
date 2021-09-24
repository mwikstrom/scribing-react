import clsx from "clsx";
import React, { useCallback, useMemo, useState } from "react";
import { createUseStyles } from "react-jss";
import { FlowButton } from "scribing";
import { flowNode } from "./FlowNodeComponent";
import { FlowView } from "./FlowView";
import { useCtrlKey } from "./internal/hooks/use-ctrl-key";
import { makeJssId } from "./internal/utils/make-jss-id";

export const FlowButtonView = flowNode<FlowButton>((props, ref) => {
    const { node, theme: paraTheme, ...forward } = props;
    const { editable, components } = forward;
    const { button: Component } = components;
    const theme = useMemo(() => paraTheme.getFlowTheme(), [paraTheme]);
    const classes = useStyles();
    const [hover, setHover] = useState(false);
    const ctrlKey = useCtrlKey();
    const onMouseEnter = useCallback(() => setHover(true), [setHover]);
    const onMouseLeave = useCallback(() => setHover(false), [setHover]);
    const onClick = useCallback((e: React.MouseEvent) => {
        if (editable) {
            e.preventDefault();
        }
    }, [editable]);
    const clickable = !editable || (hover && ctrlKey);
    return (
        <Component 
            ref={ref as any} // TODO: FIX any
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={clsx(
                classes.root,
                editable && classes.editable,
                clickable && classes.clickable,
            )}
            children={(
                <FlowView
                    {...forward}
                    content={node.content}
                    theme={theme}
                />
            )}
        />
    );
});

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
