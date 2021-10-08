import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
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
import { useShowTip } from "./TipsAndTools";
import { useFlowComponentMap } from "../FlowComponentMapScope";

/** @internal */
export type LinkViewProps = Omit<FlowNodeComponentProps, "node" | "ref"> & {
    children: FlowNode[];
    link: Interaction;
}

/** @internal */
export const LinkView: FC<LinkViewProps> = props => {
    const { children: childNodes, link } = props;
    const keyManager = useMemo(() => new FlowNodeKeyManager(), []);
    const classes = useStyles();
    const { link: Component } = useFlowComponentMap();
    const [hover, setHover] = useState(false);
    const ctrlKey = useCtrlKey();
    const editMode = useEditMode();
    const [rootElem, setRootElem] = useState<HTMLElement | null>(null);
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
        if (!clickable) {
            e.preventDefault();
        } else if (!href) {
            e.preventDefault();
            invokeAction();
        }
    }, [href, clickable, invokeAction]);
    const showTip = useShowTip();
    const locale = useFlowLocale();
    useEffect(() => {
        if (editMode && !clickable && rootElem && hover) {
            return showTip(rootElem, locale.hold_ctrl_key_to_enable_interaction);
        }
    }, [!!editMode, clickable, rootElem, hover, locale]);
    const keyRenderer = keyManager.createRenderer();
    return (
        <Component
            ref={setRootElem}
            href={href}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={clsx(
                classes.root,
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
    editable: {
        cursor: "text",
    },
    clickable: {
        cursor: "pointer",
    },
}, {
    generateId: makeJssId("Link"),
});
