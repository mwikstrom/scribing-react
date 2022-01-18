import clsx from "clsx";
import React, { FC, MouseEvent, useCallback, useMemo, useState } from "react";
import { DynamicText, ParagraphStyle, TextStyle, TextStyleProps } from "scribing";
import { createUseFlowStyles } from "./JssTheming";
import { getTextCssProperties } from "./utils/text-style-to-css";
import { flowNode } from "./FlowNodeComponent";
import { getTextStyleClassNames, textStyles } from "./utils/text-style-to-classes";
import { useObservedScript } from "scripthost-react";
import { useParagraphTheme } from "./ParagraphThemeScope";
import Icon from "@mdi/react";
import { mdiLoading } from "@mdi/js";
import { useFormattingMarks } from "./FormattingMarksScope";
import { useFlowLocale } from "../FlowLocaleScope";
import { useEditMode } from "./EditModeScope";
import { useScriptVariables } from "./ScriptVariablesScope";
import { useFlowCaretContext } from "./FlowCaretScope";
import { ScribingTooltipProps, useScribingComponents } from "../ScribingComponents";

export const DynamicTextView = flowNode<DynamicText>((props, outerRef) => {
    const { node, selection } = props;
    const { expression, style: givenStyle } = node;
    const { Tooltip } = useScribingComponents();
    const theme = useParagraphTheme();
    
    const style = useMemo(() => {
        let ambient = theme.getAmbientTextStyle();
        if (givenStyle.link) {
            ambient = ambient.merge(theme.getLinkStyle());
        }
        return ambient.merge(givenStyle);
    }, [givenStyle, theme]);

    const para = useMemo(() => theme.getAmbientParagraphStyle(), [theme]);
    const classes = useStyles();
    
    const [rootElem, setRootElem] = useState<HTMLElement | null>(null);
    const ref = useCallback((dom: HTMLElement | null) => {
        outerRef(dom);
        setRootElem(dom);
    }, [outerRef]);

    const vars = useScriptVariables();
    const evaluated = useObservedScript(expression, { vars });
    const locale = useFlowLocale();
    const editMode = useEditMode();
    
    const empty = useMemo(() => {
        const { result, ready, error } = evaluated;
        if (!expression) {
            return true;
        } else if (ready && !error) {
            return result === void(0) || result === "";
        } else {
            return false;
        }
    }, [expression, evaluated]);

    const selected = selection === true;
    const children = useMemo(() => {
        const { result, error, ready } = evaluated;
        
        if (!ready) {
            return <Icon path={mdiLoading} size={0.5} spin={0.5}/>;
        }

        if (empty) {
            if (!editMode) {
                return null;
            }

            return (
                <RenderValue
                    classes={classes}
                    style={style.unset("color")}
                    para={para}
                    value={expression ? locale.void_result : locale.void_script}
                    selected={selected}
                />
            );
        }

        if (error) {
            return (
                <RenderValue
                    classes={classes}
                    style={style.unset("color")}
                    para={para}
                    value={locale.script_error}
                    selected={selected}
                />
            );
        }

        return (
            <RenderValue
                classes={classes}
                style={style}
                para={para}
                value={result}
                selected={selected}
            />
        );
    }, [evaluated, locale, empty, editMode, classes, style]);   

    const tooltipProps = useMemo<Omit<ScribingTooltipProps, "children">>(() => {
        const { error } = evaluated;
        let title: string | null = null;
        if (error && !empty) {
            title = error.message;
        }
        return { title };
    }, [evaluated, empty]);

    const formattingMarks = useFormattingMarks();
    const isPending = !evaluated.ready;
    const hasError = evaluated.error !== null && !empty;
    const showEmpty = !!editMode && empty;
    const { native: nativeSelection } = useFlowCaretContext();
    const className = clsx(
        classes.root, 
        isPending && classes.pending,
        hasError && classes.error,
        showEmpty && classes.empty,
        formattingMarks && !isPending && !hasError && !showEmpty && classes.formattingMarks,
        selected && !nativeSelection && (editMode === "inactive" ? classes.selectedInactive : classes.selected),
    );

    const onDoubleClick = useCallback((e: MouseEvent<HTMLElement>) => {
        const domSelection = document.getSelection();
        if (domSelection && rootElem) {
            if (domSelection && domSelection.rangeCount === 1) {
                domSelection.getRangeAt(0).selectNode(rootElem);
                e.stopPropagation();
            }
        }
    }, [rootElem]);

    return (
        <Tooltip {...tooltipProps}>
            <span
                ref={ref}
                contentEditable={false}
                className={className}
                children={children}
                onDoubleClick={onDoubleClick}
            />
        </Tooltip>
    );
});

const useStyles = createUseFlowStyles("DynamicText", ({palette, typography}) => ({
    ...textStyles(palette, typography),
    root: {
        whiteSpace: "pre-wrap", // Preserve white space, wrap as needed
        cursor: "default",
    },
    selected: {
        backgroundColor: palette.selection,
        color: palette.selectionText,
    },
    selectedInactive: {
        backgroundColor: palette.inactiveSelection,
        color: palette.inactiveSelectionText,
    },
    formattingMarks: {
        outlineStyle: "dashed",
        outlineWidth: 1,
        outlineColor: palette.subtle,
        outlineOffset: 0,
    },
    error: makeOutlineCssProps(palette.error),
    pending: makeOutlineCssProps(palette.subtle),
    empty: makeOutlineCssProps(palette.subtle),
}));

const makeOutlineCssProps = (color: string) => ({
    display: "inline-block",
    padding: "0 .5rem",
    color: color,
    outlineStyle: "dashed",
    outlineWidth: 1,
    outlineColor: color,
    outlineOffset: "0.2rem",
});

interface RenderValueProps {
    classes: ReturnType<typeof useStyles>;
    style: TextStyle;
    para: ParagraphStyle;
    value: unknown;
    selected: boolean;
}

const RenderValue: FC<RenderValueProps> = props => {
    const { value, ...rest } = props;
    if (Array.isArray(value)) {
        return (
            <>
                {
                    value.map((item, index) => (
                        <RenderValue
                            key={index}
                            value={item}
                            {...rest}
                        />
                    ))
                }
            </>
        );
    } else if (isTextObject(value)) {
        const { text } = value;        
        const { classes, para, selected } = rest;
        const forward = { classes, para, selected };
        const style = isStyleObject(value) ? props.style.merge(new TextStyle(value.style)) : props.style;
        return <RenderValueSpan {...forward} style={style} value={text}/>;
    } else {
        return <RenderValueSpan {...props}/>;
    }    
};

function isTextObject(thing: unknown): thing is { text: string } {
    return (
        isRecordObject(thing) &&
        typeof thing["text"] === "string"
    );
}

function isStyleObject(thing: unknown): thing is { style: TextStyleProps } {
    return (
        isRecordObject(thing) &&
        TextStyle.dataType.test(thing["style"])
    );
}

function isRecordObject(thing: unknown): thing is Record<string, unknown> {
    return (
        typeof thing === "object" &&
        thing !== null
    );
}

const RenderValueSpan: FC<RenderValueProps> = ({ classes, style, value, para, selected }) => {
    const css = useMemo(() => getTextCssProperties(style, para), [style, para]);
    const className = useMemo(() => clsx(
        ...getTextStyleClassNames(style, classes), 
        selected && classes.selected
    ), [style, classes]);
    return <span style={css} className={className}>{String(value)}</span>;
};

