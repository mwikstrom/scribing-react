import React, { FC, useCallback, useMemo, useState } from "react";
import { createUseStyles } from "react-jss";
import { FlowNode, Interaction, OpenUrl } from "scribing";
import { makeJssId } from "./utils/make-jss-id";
import { FlowNodeView } from "../FlowNodeView";
import { FlowNodeKeyManager } from "./FlowNodeKeyManager";
import { FlowNodeComponentProps } from "../FlowNodeComponent";
import clsx from "clsx";
import { useCtrlKey } from "./hooks/use-ctrl-key";
import { useInteractionInvoker } from "../useInteractionInvoker";
import { useFlowLocale } from "../FlowLocaleScope";
import { useEditMode } from "../EditModeScope";
import { useFlowComponentMap } from "..";

/** @internal */
export type LinkViewProps = Omit<FlowNodeComponentProps, "node" | "ref"> & {
    children: FlowNode[];
    link: Interaction;
}

/** @internal */
export const LinkView: FC<LinkViewProps> = props => {
    const { children: childNodes, link } = props;
    const keyManager = useMemo(() => new FlowNodeKeyManager(), []);
    const locale = useFlowLocale();
    const classes = useStyles();
    const { link: Component } = useFlowComponentMap();
    const [hover, setHover] = useState(false);
    const ctrlKey = useCtrlKey();
    const editMode = useEditMode();
    const clickable = !editMode || (hover && ctrlKey);
    const href = useMemo(() => {
        if (link instanceof OpenUrl) {
            return link.url;
        } else {
            return "";
        }
    }, [link]);
    const onMouseEnter = useCallback(() => setHover(true), [setHover]);
    const onMouseLeave = useCallback(() => setHover(false), [setHover]);
    const invokeAction = useInteractionInvoker(link);
    const onClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        if (!editMode || e.ctrlKey) {
            invokeAction();
        }
    }, [editMode, invokeAction]);
    const keyRenderer = keyManager.createRenderer();
    return (
        <Component
            href={href}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            title={editMode && !clickable ? locale.hold_ctrl_key_to_enable_interaction : undefined}
            className={clsx(
                classes.root,
                hover && classes.hover,
                clickable ? classes.clickable : !!editMode && classes.editable,
            )}
            children={childNodes.map(child => (
                <FlowNodeView
                    key={keyRenderer.getNodeKey(child)}
                    node={child}
                />
            ))}
        />
    );
};

const useStyles = createUseStyles({
    root: {
        textDecoration: "none",
    },
    hover: {
        backgroundColor: "yellow",
    },
    editable: {
        cursor: "text",
    },
    clickable: {
        cursor: "pointer",
    },
}, {
    generateId: makeJssId("Link"),
});
