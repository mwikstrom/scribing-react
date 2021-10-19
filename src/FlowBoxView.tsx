import clsx from "clsx";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    FlowBox, 
    FlowBoxSelection, 
    FlowSelection, 
    NestedFlowSelection 
} from "scribing";
import { useEditMode } from "./EditModeScope";
import { useFlowComponentMap } from "./FlowComponentMapScope";
import { useFlowLocale } from "./FlowLocaleScope";
import { flowNode } from "./FlowNodeComponent";
import { FlowView } from "./FlowView";
import { useCtrlKey } from "./internal/hooks/use-modifier-key";
import { useIsParentSelectionActive } from "./internal/hooks/use-is-parent-selection-active";
import { createUseFlowStyles } from "./internal/JssTheming";
import { FlowAxis, setupFlowAxisMapping } from "./internal/mapping/flow-axis";
import { useShowTip } from "./internal/TooltipScope";
import { useInteractionInvoker } from "./useInteractionInvoker";
import { getBoxCssProperties } from "./internal/utils/box-style-to-css";
import { boxStyles, getBoxStyleClassNames } from "./internal/utils/box-style-to-classes";
import { mdiAlert, mdiAlertOctagonOutline, mdiAlertOutline, mdiChatOutline, mdiCheck, mdiCheckCircleOutline, mdiHandPointingRight, mdiInformation, mdiInformationOutline, mdiMessageOutline, mdiStop } from "@mdi/js";
import Icon from "@mdi/react";
import { useFlowPalette } from ".";

export const FlowBoxView = flowNode<FlowBox>((props, outerRef) => {
    const { node } = props;
    const { content, style } = node;
    const { box: Component } = useFlowComponentMap();
    const classes = useStyles();
    const [hover, setHover] = useState(false);
    const ctrlKey = useCtrlKey();
    
    const [rootElem, setRootElem] = useState<HTMLElement | null>(null);
    const ref = useCallback((dom: HTMLElement | null) => {
        outerRef(dom);
        setRootElem(dom);
        if (dom) {
            setupFlowAxisMapping(dom, new FlowBoxContentAxis());
        }        
    }, [outerRef]);

    const isParentSelectionActive = useIsParentSelectionActive(rootElem);

    const onMouseEnter = useCallback(() => setHover(true), [setHover]);
    const onMouseLeave = useCallback(() => setHover(false), [setHover]);
    
    const editMode = useEditMode();
    const clickable = !!style.interaction && (!editMode || (hover && ctrlKey));
    const invokeAction = useInteractionInvoker(style.interaction ?? null);
    const [pending, setPending] = useState<Promise<void> | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const onClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        if (clickable && !pending) {
            setError(null);
            setPending(invokeAction());
        }
    }, [clickable, pending, invokeAction]);

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
        if (editMode && !clickable && rootElem && hover && style.interaction) {
            return showTip(rootElem, locale.hold_ctrl_key_to_enable_interaction);
        }
    }, [!!editMode, clickable, rootElem, hover, locale]);


    useEffect(() => {
        if (error && rootElem && hover) {
            return showTip(rootElem, error.message);
        }
    }, [error, rootElem, hover, locale]);

    const palette = useFlowPalette();
    const css = useMemo(() => getBoxCssProperties(style), [style]);
    const className = useMemo(() => clsx(
        classes.root,
        clickable ? classes.clickable : !!editMode && classes.editable,
        pending && classes.pending,
        error && classes.error,
        clickable && hover && classes.hover,
        ...getBoxStyleClassNames(style, classes),
    ), [clickable, pending, error, editMode, style, classes]);

    let children = (
        <div
            contentEditable={!!editMode && !clickable && !isParentSelectionActive}
            suppressContentEditableWarning={true}
            className={classes.content}
            children={<FlowView content={content}/>}
        />
    );

    if (style.variant === "alert" && style.color && style.color !== "default") {
        let icon: string | undefined;
        
        if (style.color === "information") {
            icon = mdiInformationOutline;
        } else if (style.color === "warning") {
            icon = mdiAlertOutline;
        } else if (style.color === "success") {
            icon = mdiCheckCircleOutline;
        } else if (style.color === "error") {
            icon = mdiAlertOctagonOutline;
        }

        if (icon) {
            children = (
                <div className={classes.alertBody}>
                    <Icon path={icon} size={1} className={classes.alertIcon} color={palette[style.color]}/>
                    {children}
                </div>
            );
        }
    }

    return (
        <Component 
            ref={ref}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={className}
            style={css}
            contentEditable={false}
            children={children}
        />
    );
});

class FlowBoxContentAxis extends FlowAxis {
    equals(other: FlowAxis): boolean {
        return other instanceof FlowBoxContentAxis;
    }

    createNestedSelection(
        outerPosition: number,
        innerSelection: FlowSelection,
    ): NestedFlowSelection {
        return new FlowBoxSelection({
            position: outerPosition,
            content: innerSelection,
        });
    }

    getInnerSelection(outer: NestedFlowSelection): FlowSelection | null {
        if (outer instanceof FlowBoxSelection) {
            return outer.content;
        } else {
            return null;
        }
    }
}

// TODO: FIX !important rules -- should be part of theme?
const useStyles = createUseFlowStyles("FlowBox", ({palette}) => ({
    ...boxStyles(palette),
    root: {
        borderRadius: 2,
        padding: "2px 5px",
    },
    alertBody: {
        position: "relative",
        marginLeft: 30,
    },
    alertIcon: {
        position: "absolute",
        left: -30,
    },
    content: {
        outline: "none",
        "$alert>&": {
            flex: 1,
        },
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
