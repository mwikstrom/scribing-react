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

/** @internal */
export type LinkViewProps = Omit<FlowNodeComponentProps, "node" | "ref"> & {
    children: FlowNode[];
    link: Interaction;
}

/** @internal */
export const LinkView: FC<LinkViewProps> = props => {
    const { children, link, components, editMode, ...restProps } = props;
    const keyManager = useMemo(() => new FlowNodeKeyManager(), []);
    const locale = useFlowLocale();
    const classes = useStyles();
    const Component = components.link ?? "a";
    const forwardProps = { components, editMode, ...restProps };
    const [hover, setHover] = useState(false);
    const ctrlKey = useCtrlKey();
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
            title={editMode && !clickable ? locale.holdCtrlKeyToEnableLink : undefined}
            className={clsx(
                classes.root,
                editMode && classes.editable,
                clickable && classes.clickable,
            )}
            children={children.map(child => (
                <FlowNodeView
                    key={keyRenderer.getNodeKey(child)}
                    node={child}
                    {...forwardProps}
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
    generateId: makeJssId("Paragraph"),
});
