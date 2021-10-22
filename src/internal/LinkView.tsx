import React, { FC, useMemo, useState } from "react";
import { FlowNode, Interaction } from "scribing";
import { FlowNodeView } from "./FlowNodeView";
import { FlowNodeKeyManager } from "./FlowNodeKeyManager";
import { FlowNodeComponentProps } from "./FlowNodeComponent";
import clsx from "clsx";
import { useEditMode } from "./EditModeScope";
import { useFlowComponentMap } from "./FlowComponentMapScope";
import { createUseFlowStyles } from "./JssTheming";
import { useInteraction } from "./hooks/use-interaction";

/** @internal */
export type LinkViewProps = Omit<FlowNodeComponentProps, "node" | "ref"> & {
    children: FlowNode[];
    link: Interaction;
}

/** @internal */
export const LinkView: FC<LinkViewProps> = props => {
    const { children: childNodes, link } = props;
    const { link: Component } = useFlowComponentMap();
    const classes = useStyles();
    const [rootElem, setRootElem] = useState<HTMLElement | null>(null);
    const { clickable, pending, error, href } = useInteraction(link, rootElem);
    const editMode = useEditMode();
    const keyManager = useMemo(() => new FlowNodeKeyManager(), []);
    const keyRenderer = keyManager.createRenderer();

    return (
        <Component
            ref={setRootElem}
            href={href}
            className={clsx(
                classes.root,
                clickable ? classes.clickable : !!editMode && classes.editable,
                pending && classes.pending,
                error && classes.error,
            )}
            children={childNodes.map(child => (
                <FlowNodeView
                    key={keyRenderer.getNodeKey(child)}
                    node={child}
                />
            ))}
            contentEditable={!!editMode && !clickable}
            suppressContentEditableWarning={true}
        />
    );
};

const useStyles = createUseFlowStyles("Link", ({palette}) => ({
    root: {
        textDecoration: "none",
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
