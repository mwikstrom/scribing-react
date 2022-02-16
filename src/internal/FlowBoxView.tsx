import clsx from "clsx";
import React, { FC, forwardRef, useCallback, useMemo, useState } from "react";
import {
    BoxStyle,
    BoxVariant,
    FlowBox, 
    FlowBoxSelection, 
    FlowContent, 
    FlowRangeSelection, 
    FlowSelection, 
    FlowTheme, 
    NestedFlowSelection, 
    ParagraphBreak
} from "scribing";
import { EditMode, useEditMode } from "./EditModeScope";
import { useFlowComponentMap } from "./FlowComponentMapScope";
import { flowNode } from "./FlowNodeComponent";
import { FlowContentView } from "./FlowContentView";
import { useIsParentSelectionActive } from "./hooks/use-is-parent-selection-active";
import { createUseFlowStyles } from "./JssTheming";
import { FlowAxis, setupFlowAxisMapping } from "./mapping/flow-axis";
import { getBoxCssProperties } from "./utils/box-style-to-css";
import { boxStyles, getBoxStyleClassNames } from "./utils/box-style-to-classes";
import { mdiLoading } from "@mdi/js";
import Icon from "@mdi/react";
import { FlowThemeScope, useFlowTheme } from "./FlowThemeScope";
import { useFormattingMarks } from "./FormattingMarksScope";
import { useInteraction } from "./hooks/use-interaction";
import { useObservedScript } from "scripthost-react";
import { ScriptVariablesScope, useScriptVariables } from "./ScriptVariablesScope";
import { ScriptValue } from "scripthost-core";
import { registerTemplateNode } from "./mapping/dom-node";
import Color from "color";
import { getFlowBoxContentSelection } from "./utils/get-sub-selection";
import { ScribingButtonProps, ScribingTooltipProps, useScribingComponents } from "../ScribingComponents";
import { useForwardedRef } from "./hooks/use-forwarded-ref";

export const FlowBoxView = flowNode<FlowBox>((props, outerRef) => {
    const { node, selection: outerSelection } = props;
    const { content, style: givenStyle } = node;
    const { Tooltip, Button } = useScribingComponents();
    const classes = useStyles();
    
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
    const innerSelection = useMemo(() => getFlowBoxContentSelection(outerSelection), [outerSelection]);
    const editMode = useEditMode();
    const outerVars = useScriptVariables();
    const vars = useMemo(() => style.source ? ({
        ...outerVars,
        ...Object.fromEntries(style.source.messages.entries()),
    }) : outerVars, [outerVars, style.source]);
    const hasSource = !!style.source;
    const {
        result: sourceResult,
        ready: sourceReady,
        error: sourceError,
    } = useObservedScript(style.source?.code ?? null, { vars });
    const disabled = hasSource && sourceResult === false;
    const {
        clickable,
        hover,
        href,
        pending: interactionPending,
        error,
        message,
    } = useInteraction(style.interaction ?? null, rootElem, sourceError, disabled);
    const tooltipProps = useMemo<Omit<ScribingTooltipProps, "children">>(() => {
        const title = disabled ? null : message;
        return { title };
    }, [disabled, message]);
    const data = useMemo(() => {
        if (!hasSource || !sourceReady || sourceResult === void(0) || sourceResult === null) {
            return [];
        } else if (Array.isArray(sourceResult)) {
            return sourceResult;
        } else {
            return [sourceResult];
        }
    }, [hasSource, sourceReady, sourceResult]);
    const lastBreak = useMemo(() => {
        let result: ParagraphBreak | null = null;
        for (const node of content.nodes) {
            if (node instanceof ParagraphBreak) {
                result = node;
            }
        }
        return result;
    }, [content]);
    const maybeHidden = hasSource && !sourceReady;
    const hidden = hasSource && sourceReady && data.length === 0;
    const omitted = !editMode && (hidden || maybeHidden);

    const contentElementProps: ContentElementProps = {
        className: classes.content,
        contentEditable: !!editMode && !clickable && !isParentSelectionActive,
        theme: innerTheme,
        content,
        selection: innerSelection,
    };

    const children = !hasSource ? (
        <ContentElement {...contentElementProps}/>
    ) : !sourceReady ? (
        <div className={classes.sourcePending}>
            <Icon path={mdiLoading} size={1} spin={0.5}/>
        </div>
    ) : sourceError || data.length === 0 ? (
        <TemplateElement {...contentElementProps}/>
    ) : data.map((item, index) => (
        <TemplateElement
            {...contentElementProps}
            key={index}
            data={item}
            isClone={index > 0}
            prevBreak={index > 0 ? lastBreak : null}
        />
    ));

    const commonProps: ScribingButtonProps = {
        ref,
        href,
        pending: interactionPending,
        error,
        disabled,
        hover,
        style,
        children,
    };

    if (omitted) {
        return null;
    } else if (!editMode && clickable && RenderAsButton.includes(style.variant)) {        
        return (
            <Tooltip {...tooltipProps}>
                <Button {...commonProps}/>
            </Tooltip>
        );
    } else {
        return (
            <Tooltip {...tooltipProps}>
                <EditableBox
                    {...commonProps}
                    innerSelection={innerSelection}
                    clickable={clickable}
                    editMode={editMode}
                    hidden={hidden}
                />
            </Tooltip>
        );
    }
});

const RenderAsButton: readonly (BoxVariant | undefined)[] = [
    "basic",
    "outlined",
    "contained",
];

interface EditableBoxProps extends ScribingButtonProps {
    innerSelection: FlowSelection | boolean;
    clickable: boolean;
    editMode: EditMode;
    hidden: boolean;
}

const EditableBox = forwardRef<HTMLElement, EditableBoxProps>((props, outerRef) => {
    const {
        pending,
        error,
        disabled,
        children,
        hover,
        style,
        innerSelection,
        clickable,
        editMode,
        hidden,
        ...otherProps
    } = props;
    const { box: Component } = useFlowComponentMap();
    const innerRef = useForwardedRef(outerRef);
    const classes = useStyles();
    const css = useMemo(() => getBoxCssProperties(style), [style]);
    const formattingMarks = useFormattingMarks();
    const showSelectionOutline = !error && (
        innerSelection === true ||
        (innerSelection instanceof FlowRangeSelection && !innerSelection.isCollapsed)
    );
    const showFormattingOutline = formattingMarks && !showSelectionOutline && !hasBorder(style);
    const className = clsx(
        classes.root,
        clickable ? classes.clickable : !!editMode && classes.editable,
        pending && classes.interactionPending,
        error && classes.error,
        hidden && classes.hidden,
        clickable && hover && classes.hover,
        showSelectionOutline && classes.selected,
        innerSelection === true && classes.selectedAll,
        showSelectionOutline && editMode === "inactive" ? classes.selectedInactive : classes.selectedActive,
        showFormattingOutline && classes.formattingMarks,
        disabled && classes.disabled,
        ...getBoxStyleClassNames(style, classes),
    );
    return (
        <Component 
            {...otherProps}
            ref={innerRef}
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

const useStyles = createUseFlowStyles("FlowBox", ({palette}) => ({
    ...boxStyles(palette),
    root: {
        borderRadius: 2,
    },
    hidden: {
        opacity: 0.75,
        background: `repeating-linear-gradient(
            45deg,
            ${Color(palette.subtle).fade(0.85)},
            ${Color(palette.subtle).fade(0.85)} 10px,
            ${Color(palette.subtle).fade(0.98)} 10px,
            ${Color(palette.subtle).fade(0.98)} 20px
        )`,
    },
    selected: {
        borderRadius: 0,
        outlineStyle: "dashed",
        outlineWidth: 1,
        outlineOffset: 2,
    },
    selectedAll: {
        borderRadius: 0,
        outlineStyle: "solid",
        outlineWidth: 2,
        outlineOffset: 2,
    },
    selectedActive: {
        outlineColor: palette.selection,
    },
    selectedInactive: {
        outlineColor: palette.inactiveSelection,
    },
    formattingMarks: {
        outlineStyle: "dashed",
        outlineWidth: 1,
        outlineColor: palette.subtle,
        outlineOffset: 0,
    },
    content: {
        textIndent: 0,
        outline: "none",
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
        userSelect: "none",
        cursor: "pointer",
        "&$disabled": {
            cursor: "default",
        },
    },
    interactionPending: {
        cursor: "wait",
    },
    sourcePending: {
        color: palette.subtle,
    },
    error: {
        outlineStyle: "dashed",
        outlineWidth: 1,
        outlineColor: palette.error,
        outlineOffset: "0.2rem",
    },
}));

const hasBorder = (style?: BoxStyle): boolean => !!style && style.variant !== "basic";

interface ContentElementProps {
    className: string;
    contentEditable: boolean;
    theme: FlowTheme;
    content: FlowContent;
    selection: FlowSelection | boolean;
    prevBreak?: ParagraphBreak | null;
    templateRef?: (elem: HTMLElement | null) => void;
}

const ContentElement: FC<ContentElementProps> = props => {
    const { theme, content, selection, templateRef, prevBreak, ...rest } = props;
    return (
        <div
            {...rest}
            ref={templateRef}
            suppressContentEditableWarning={true}
            children={
                <FlowThemeScope theme={theme}>
                    <FlowContentView
                        content={content}
                        selection={selection}
                        prevBreak={prevBreak}
                    />
                </FlowThemeScope>
            }
        />
    );
};

interface TemplateElementProps extends ContentElementProps {
    data?: ScriptValue;
    isClone?: boolean;
}

const TemplateElement: FC<TemplateElementProps> = props => {
    const { data, isClone, contentEditable, ...rest } = props;
    const vars = useMemo(() => ({ data }), [data]);
    return (
        <ScriptVariablesScope variables={vars}>
            <ContentElement
                {...rest}
                contentEditable={contentEditable && !isClone}
                templateRef={registerTemplateNode}
            />
        </ScriptVariablesScope>
    );
};
