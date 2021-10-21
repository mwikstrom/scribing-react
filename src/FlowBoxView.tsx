import clsx from "clsx";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    BoxStyle,
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
import { mdiAlertOctagonOutline, mdiAlertOutline, mdiCheckCircleOutline, mdiInformationOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { useFlowPalette } from "./FlowPaletteScope";
import { FlowThemeScope, useFlowTheme } from "./FlowThemeScope";
import { useFormattingMarks } from "./FormattingMarksScope";
import { useIsSelected } from "./internal/hooks/use-is-selected";

export const FlowBoxView = flowNode<FlowBox>((props, outerRef) => {
    const { node } = props;
    const { content, style: givenStyle } = node;
    const { box: Component } = useFlowComponentMap();
    const classes = useStyles();
    const [hover, setHover] = useState(false);
    const ctrlKey = useCtrlKey();
    
    const style = useMemo(() => BoxStyle.ambient.merge(givenStyle), [givenStyle]);
    const outerTheme = useFlowTheme();
    const innerTheme = useMemo(() => outerTheme.getBoxTheme(style), [style, outerTheme]);

    const [rootElem, setRootElem] = useState<HTMLElement | null>(null);
    const ref = useCallback((dom: HTMLElement | null) => {
        outerRef(dom);
        setRootElem(dom);
        if (dom) {
            setupFlowAxisMapping(dom, new FlowBoxContentAxis());
        }        
    }, [outerRef]);

    const isParentSelectionActive = useIsParentSelectionActive(rootElem);
    const isSelected = useIsSelected(rootElem);

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
        } else if (!clickable && editMode && e.detail === 4 && rootElem) {
            const domSelection = document.getSelection();
            if (domSelection && domSelection.rangeCount === 1) {
                domSelection.getRangeAt(0).selectNode(rootElem);
                e.stopPropagation();
            }    
        }
    }, [clickable, pending, invokeAction, editMode, rootElem]);

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

    const message = useMemo(
        () => error ? (
            error.message
        ) : editMode && !clickable && style.interaction && !pending ? (
            locale.hold_ctrl_key_to_enable_interaction
        ) : null, 
        [!!editMode, clickable, locale, !!style.interaction, !pending, error]
    );
    
    useEffect(() => {
        if (rootElem && hover && message) {
            let hideTip: (() => void) | undefined;
            const timer = setTimeout(() => hideTip = showTip(rootElem, message), 500);
            return () => {
                clearTimeout(timer);
                if (hideTip) {
                    hideTip();
                }
            };
        }
    }, [rootElem, hover, message, showTip]);

    const palette = useFlowPalette();
    const css = useMemo(() => getBoxCssProperties(style), [style]);
    const formattingMarks = useFormattingMarks();
    const showSelectionOutline = isSelected && !error;
    const showFormattingOutline = formattingMarks && !showSelectionOutline && !hasBorder(style);
    const className = useMemo(() => clsx(
        classes.root,
        clickable ? classes.clickable : !!editMode && classes.editable,
        pending && classes.pending,
        error && classes.error,
        clickable && hover && classes.hover,
        showSelectionOutline && classes.selected,
        showFormattingOutline && classes.formattingMarks,
        ...getBoxStyleClassNames(style, classes),
    ), [clickable, pending, error, editMode, style, classes]);

    let children = (
        <div
            contentEditable={!!editMode && !clickable && !isParentSelectionActive}
            suppressContentEditableWarning={true}
            className={classes.content}
            children={
                <FlowThemeScope theme={innerTheme}>
                    <FlowView content={content}/>
                </FlowThemeScope>
            }
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
    selected: {
        outlineStyle: "dashed",
        outlineWidth: 2,
        outlineColor: palette.subtle,
        outlineOffset: 2,
    },
    formattingMarks: {
        outlineStyle: "dashed",
        outlineWidth: 1,
        outlineColor: palette.subtle,
        outlineOffset: 0,
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
        userSelect: "none",
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

const hasBorder = (style?: BoxStyle): boolean => !!style && style.variant !== "basic";