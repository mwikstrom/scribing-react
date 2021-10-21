import clsx from "clsx";
import React, { FC, useCallback, useMemo, useState } from "react";
import {
    BoxStyle,
    FlowBox, 
    FlowBoxSelection, 
    FlowContent, 
    FlowSelection, 
    FlowTheme, 
    NestedFlowSelection 
} from "scribing";
import { useEditMode } from "./EditModeScope";
import { useFlowComponentMap } from "./FlowComponentMapScope";
import { flowNode } from "./FlowNodeComponent";
import { FlowView } from "./FlowView";
import { useIsParentSelectionActive } from "./internal/hooks/use-is-parent-selection-active";
import { createUseFlowStyles } from "./internal/JssTheming";
import { FlowAxis, setupFlowAxisMapping } from "./internal/mapping/flow-axis";
import { getBoxCssProperties } from "./internal/utils/box-style-to-css";
import { boxStyles, getBoxStyleClassNames } from "./internal/utils/box-style-to-classes";
import { mdiAlertOctagonOutline, mdiAlertOutline, mdiCheckCircleOutline, mdiInformationOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { useFlowPalette } from "./FlowPaletteScope";
import { FlowThemeScope, useFlowTheme } from "./FlowThemeScope";
import { useFormattingMarks } from "./FormattingMarksScope";
import { useIsSelected } from "./internal/hooks/use-is-selected";
import { useInteraction } from "./internal/hooks/use-interaction";
import { useObservedScript } from "scripthost-react";
import { ScriptVaraiblesScope, useScriptVariables } from "./ScriptVariablesScope";
import { ScriptValue } from "scripthost-core";
import { registerTemplateNode } from "./internal/mapping/dom-node";
import Color from "color";

export const FlowBoxView = flowNode<FlowBox>((props, outerRef) => {
    const { node } = props;
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
    const isSelected = useIsSelected(rootElem);
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
        pending,
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
        sourceReady && data.length === 0 && classes.hidden,
        clickable && hover && classes.hover,
        showSelectionOutline && classes.selected,
        showFormattingOutline && classes.formattingMarks,
        ...getBoxStyleClassNames(style, classes),
    ), [clickable, pending, error, editMode, style, classes]);

    const contentElementProps: ContentElementProps = {
        className: classes.content,
        contentEditable: !!editMode && !clickable && !isParentSelectionActive,
        theme: innerTheme,
        content,
    };

    let children = !hasSource || sourceResult === true ? (
        <ContentElement {...contentElementProps}/>
    ) : sourceError || data.length === 0 ? (
        <TemplateElement
            {...contentElementProps}
            data={undefined}
        />
    ) : data.map((item, index) => (
        <TemplateElement
            {...contentElementProps}
            key={index}
            data={item}
        />
    ));

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

interface ContentElementProps {
    className: string;
    contentEditable: boolean;
    theme: FlowTheme;
    content: FlowContent;
    templateRef?: (elem: HTMLElement | null) => void;
}

const ContentElement: FC<ContentElementProps> = props => {
    const { theme, content, templateRef, ...rest } = props;
    return (
        <div
            {...rest}
            ref={templateRef}
            suppressContentEditableWarning={true}
            children={
                <FlowThemeScope theme={theme}>
                    <FlowView content={content}/>
                </FlowThemeScope>
            }
        />
    );
};

interface TemplateElementProps extends ContentElementProps {
    data: ScriptValue;
}

const TemplateElement: FC<TemplateElementProps> = props => {
    const { data, ...rest } = props;
    const vars = useMemo(() => ({ data }), [data]);
    return (
        <ScriptVaraiblesScope variables={vars}>
            <ContentElement
                {...rest}
                templateRef={registerTemplateNode}
            />
        </ScriptVaraiblesScope>
    );
};
