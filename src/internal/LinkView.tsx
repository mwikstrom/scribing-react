import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { FlowNode, Interaction, OpenUrl } from "scribing";
import { FlowNodeView } from "../FlowNodeView";
import { FlowNodeKeyManager } from "./FlowNodeKeyManager";
import { FlowNodeComponentProps } from "../FlowNodeComponent";
import clsx from "clsx";
import { useCtrlKey } from "./hooks/use-ctrl-key";
import { useInteractionInvoker } from "../useInteractionInvoker";
import { useFlowLocale } from "../FlowLocaleScope";
import { useEditMode } from "../EditModeScope";
import { useShowTip } from "./TooltipScope";
import { useFlowComponentMap } from "../FlowComponentMapScope";
import { createUseFlowStyles } from "./JssTheming";

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
    const [hover, setHover] = useState(false);
    const ctrlKey = useCtrlKey();
    
    const [rootElem, setRootElem] = useState<HTMLElement | null>(null);
    const keyManager = useMemo(() => new FlowNodeKeyManager(), []);
    
    const href = useMemo(() => {
        if (link instanceof OpenUrl) {
            return link.url;
        } else {
            return "";
        }
    }, [link]);

    const onMouseEnter = useCallback(() => setHover(true), [setHover]);
    const onMouseLeave = useCallback(() => setHover(false), [setHover]);

    const editMode = useEditMode();
    const clickable = !editMode || (hover && ctrlKey);
    const invokeAction = useInteractionInvoker(link);
    const [pending, setPending] = useState<Promise<void> | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const onClick = useCallback((e: React.MouseEvent) => {        
        if (!clickable) {
            e.preventDefault();
        } else if (!href || editMode) {
            e.preventDefault();
            setError(null);
            setPending(invokeAction());
        }
    }, [href, clickable, editMode, invokeAction]);

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
                pending && classes.pending,
                error && classes.error,
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
