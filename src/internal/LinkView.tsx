import React, { FC, useCallback, useMemo, useState } from "react";
import { createUseStyles } from "react-jss";
import { FlowNode, Interaction, OpenUrl } from "scribing";
import { makeJssId } from "./utils/make-jss-id";
import { FlowNodeView } from "../FlowNodeView";
import { FlowNodeKeyManager } from "./FlowNodeKeyManager";
import { FlowNodeComponentProps } from "../FlowNodeComponent";
import clsx from "clsx";
import { useCtrlKey } from "./hooks/use-ctrl-key";

/** @internal */
export type LinkViewProps = Omit<FlowNodeComponentProps, "node" | "ref"> & {
    children: FlowNode[];
    link: Interaction;
}

/** @internal */
export const LinkView: FC<LinkViewProps> = props => {
    const { children, link, components, localization, editable, interact, ...restProps } = props;
    const keyManager = useMemo(() => new FlowNodeKeyManager(), []);
    const classes = useStyles();
    const Component = components.link ?? "a";
    const forwardProps = { components, localization, editable, interact, ...restProps };
    const [hover, setHover] = useState(false);
    const ctrlKey = useCtrlKey();
    const clickable = !editable || (hover && ctrlKey);
    const href = useMemo(() => {
        if (link instanceof OpenUrl) {
            return link.url;
        } else {
            return "";
        }
    }, [link]);
    const onMouseEnter = useCallback(() => setHover(true), [setHover]);
    const onMouseLeave = useCallback(() => setHover(false), [setHover]);
    const onClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        if (!editable || e.ctrlKey) {
            interact(link);
        }
    }, [editable, link, interact]);
    const keyRenderer = keyManager.createRenderer();
    return (
        <Component
            href={href}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            title={editable && !clickable ? localization.holdCtrlKeyToEnableLink : undefined}
            className={clsx(
                classes.root,
                editable && classes.editable,
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
