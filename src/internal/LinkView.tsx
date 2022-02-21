import React, { FC, useMemo, useState } from "react";
import { FlowNode, Interaction, TextStyle, TextStyleProps } from "scribing";
import { FlowNodeView } from "./FlowNodeView";
import { FlowNodeKeyManager } from "./FlowNodeKeyManager";
import { FlowNodeComponentProps, OpposingTag } from "./FlowNodeComponent";
import clsx from "clsx";
import { useEditMode } from "./EditModeScope";
import { useFlowComponentMap } from "./FlowComponentMapScope";
import { createUseFlowStyles } from "./JssTheming";
import { useInteraction } from "./hooks/use-interaction";
import { getFlowNodeSelection } from "./utils/get-sub-selection";
import { ScribingTooltipProps, useScribingComponents } from "../ScribingComponents";
import { ScriptEvalScope } from "./hooks/use-script-eval-props";
import { useParagraphTheme } from "./ParagraphThemeScope";

/** @internal */
export type LinkViewProps = Omit<FlowNodeComponentProps, "node" | "ref" | "opposingTag"> & {
    children: FlowNode[];
    opposingTags: OpposingTag[];
    link: Interaction;
}

/** @internal */
export const LinkView: FC<LinkViewProps> = props => {
    const { children: childNodes, opposingTags, link, selection: outerSelection } = props;
    const { link: Component } = useFlowComponentMap();
    const { Tooltip } = useScribingComponents();
    const classes = useStyles();
    const [rootElem, setRootElem] = useState<HTMLElement | null>(null);
    const paraTheme = useParagraphTheme();
    const uniformTextStyle = useMemo<TextStyle>(() => {
        const diff = new Set<keyof TextStyleProps>();
        let result = TextStyle.empty;
        childNodes.forEach(node => {
            const uniform = node.getUniformTextStyle(paraTheme, diff);
            if (uniform) {
                result = result.merge(uniform, diff);
            }
        });
        return result;
    }, [paraTheme, childNodes]);
    const evalScope: ScriptEvalScope = { textStyle: uniformTextStyle };
    const { clickable, pending, error, href, target, message } = useInteraction(link, rootElem, evalScope);
    const tooltipProps = useMemo<Omit<ScribingTooltipProps, "children">>(() => ({ title: message}), [message]);
    const editMode = useEditMode();
    const keyManager = useMemo(() => new FlowNodeKeyManager(), []);
    const children = useMemo(() => {
        const keyRenderer = keyManager.createRenderer();
        let pos = 0;
        return childNodes.map((child, index) => {
            const selection = getFlowNodeSelection(outerSelection, childNodes, index, child, pos);
            pos += child.size;
            return (
                <FlowNodeView
                    key={keyRenderer.getNodeKey(child)}
                    node={child}
                    opposingTag={opposingTags[index]}
                    selection={selection}
                />
            );
        });
    }, [childNodes, opposingTags, outerSelection, keyManager]);
    return (
        <Tooltip {...tooltipProps}>
            <Component
                ref={setRootElem}
                href={href}
                target={target}
                className={clsx(
                    classes.root,
                    clickable ? classes.clickable : !!editMode && classes.editable,
                    pending && classes.pending,
                    error && classes.error,
                )}
                children={children}
                contentEditable={!!editMode && !clickable}
                suppressContentEditableWarning={true}
            />
        </Tooltip>
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
