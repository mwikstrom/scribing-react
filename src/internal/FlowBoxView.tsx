import clsx from "clsx";
import React, { FC, useCallback, useMemo, useState } from "react";
import {
    BoxStyle,
    FlowBox, 
    FlowBoxSelection, 
    FlowContent, 
    FlowRangeSelection, 
    FlowSelection, 
    FlowTheme, 
    NestedFlowSelection, 
    ParagraphBreak
} from "scribing";
import { useEditMode } from "./EditModeScope";
import { useFlowComponentMap } from "./FlowComponentMapScope";
import { flowNode } from "./FlowNodeComponent";
import { FlowFragmentView } from "./FlowFragmentView";
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
import { ScriptVaraiblesScope, useScriptVariables } from "./ScriptVariablesScope";
import { ScriptValue } from "scripthost-core";
import { registerTemplateNode } from "./mapping/dom-node";
import Color from "color";
import { getFlowBoxContentSelection } from "./utils/get-sub-selection";

export const FlowBoxView = flowNode<FlowBox>((props, outerRef) => {
    const { node, selection: outerSelection } = props;
    const { content, style: givenStyle } = node;
    const { box: Component } = useFlowComponentMap();
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
    const vars = useScriptVariables();
    const hasSource = !!style.source;
    const {
        result: sourceResult,
        ready: sourceReady,
        error: sourceError,
    } = useObservedScript(style.source ?? null, { vars });
    const {
        clickable,
        hover,
        pending: interactionPending,
        error,
    } = useInteraction(style.interaction ?? null, rootElem, sourceError);
    const data = useMemo(() => {
        if (!hasSource || !sourceReady || sourceResult === void(0) || sourceResult === null || sourceResult === false) {
            return [];
        } else if (Array.isArray(sourceResult)) {
            return sourceResult;
        } else {
            return [sourceResult];
        }
    }, [hasSource, sourceReady, sourceResult]);
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
        interactionPending && classes.interactionPending,
        error && classes.error,
        hasSource && sourceReady && data.length === 0 && classes.hidden,
        clickable && hover && classes.hover,
        showSelectionOutline && classes.selected,
        innerSelection === true && classes.selectedAll,
        showSelectionOutline && editMode === "inactive" ? classes.selectedInactive : classes.selectedActive,
        showFormattingOutline && classes.formattingMarks,
        ...getBoxStyleClassNames(style, classes),
    );

    const lastBreak = useMemo(() => {
        let result: ParagraphBreak | null = null;
        for (const node of content.nodes) {
            if (node instanceof ParagraphBreak) {
                result = node;
            }
        }
        return result;
    }, [content]);
    const contentElementProps: ContentElementProps = {
        className: classes.content,
        contentEditable: !!editMode && !clickable && !isParentSelectionActive,
        theme: innerTheme,
        content,
        selection: innerSelection,
    };

    const children = !hasSource || sourceResult === true ? (
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

    return (
        <Component 
            ref={ref}
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
        cursor: "pointer",
        userSelect: "none",
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
                    <FlowFragmentView
                        nodes={content.nodes}
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
        <ScriptVaraiblesScope variables={vars}>
            <ContentElement
                {...rest}
                contentEditable={contentEditable && !isClone}
                templateRef={registerTemplateNode}
            />
        </ScriptVaraiblesScope>
    );
};
