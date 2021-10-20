import clsx from "clsx";
import React, { FC, MouseEvent, useCallback, useEffect, useMemo, useState } from "react";
import { DynamicText, TextStyle, TextStyleProps } from "scribing";
import { createUseFlowStyles } from "./internal/JssTheming";
import { getTextCssProperties } from "./internal/utils/text-style-to-css";
import { flowNode } from "./FlowNodeComponent";
import { getTextStyleClassNames, textStyles } from "./internal/utils/text-style-to-classes";
import { useObservedScript } from "scripthost-react";
import { useParagraphTheme } from "./ParagraphThemeScope";
import { useShowTip } from "./internal/TooltipScope";
import Icon from "@mdi/react";
import { mdiLoading } from "@mdi/js";
import { useFormattingMarks } from "./FormattingMarksScope";
import { useFlowLocale } from "./FlowLocaleScope";
import { useEditMode } from "./EditModeScope";

export const DynamicTextView = flowNode<DynamicText>((props, outerRef) => {
    const { node } = props;
    const { expression, style: givenStyle } = node;
    const theme = useParagraphTheme();
    
    const style = useMemo(() => {
        let ambient = theme.getAmbientTextStyle();
        if (givenStyle.link) {
            ambient = ambient.merge(theme.getLinkStyle());
        }
        return ambient.merge(givenStyle);
    }, [givenStyle, theme]);
    
    const classes = useStyles();
    
    const [rootElem, setRootElem] = useState<HTMLElement | null>(null);
    const ref = useCallback((dom: HTMLElement | null) => {
        outerRef(dom);
        setRootElem(dom);
    }, [outerRef]);

    const evaluated = useObservedScript(expression);
    const locale = useFlowLocale();
    const showTip = useShowTip();
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
                    value={expression ? locale.void_result : locale.void_script}
                />
            );
        }

        if (error) {
            return (
                <RenderValue
                    classes={classes}
                    style={style.unset("color")}
                    value={locale.script_error}
                />
            );
        }

        return (
            <RenderValue
                classes={classes}
                style={style}
                value={result}
            />
        );
    }, [evaluated, locale, empty, editMode, classes, style]);
    
    const [hover, setHover] = useState(false);
    const onMouseEnter = useCallback(() => setHover(true), [setHover]);
    const onMouseLeave = useCallback(() => setHover(false), [setHover]);

    useEffect(() => {
        const { error } = evaluated;
        if (error && rootElem && hover && !empty) {
            return showTip(rootElem, error.message);
        }
    }, [evaluated, rootElem, hover, empty]);

    const formattingMarks = useFormattingMarks();
    const isPending = !evaluated.ready;
    const hasError = evaluated.error !== null && !empty;
    const showEmpty = !!editMode && empty;
    const className = useMemo(() => clsx(
        classes.root, 
        isPending && classes.pending,
        hasError && classes.error,
        showEmpty && classes.empty,
        formattingMarks && !isPending && !hasError && !showEmpty && classes.formattingMarks,
    ), [style, classes, evaluated]);

    const onClick = useCallback((e: MouseEvent<HTMLElement>) => {
        const domSelection = document.getSelection();
        if (domSelection) {
            domSelection.selectAllChildren(e.currentTarget);
        }
    }, []);

    return (
        <span
            ref={ref}
            contentEditable={false}
            className={className}
            children={children}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        />
    );
});

const useStyles = createUseFlowStyles("DynamicText", ({palette}) => ({
    ...textStyles(palette),
    root: {
        whiteSpace: "pre-wrap", // Preserve white space, wrap as needed
        cursor: "default",
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
    value: unknown;
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
        const style = isStyleObject(value) ? props.style.merge(new TextStyle(value.style)) : props.style;
        return <RenderValueSpan classes={props.classes} style={style} value={text}/>;
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

const RenderValueSpan: FC<RenderValueProps> = ({ classes, style, value }) => {
    const css = useMemo(() => getTextCssProperties(style), [style]);
    const className = useMemo(() => clsx(...getTextStyleClassNames(style, classes)), [style, classes]);
    return <span style={css} className={className}>{String(value)}</span>;
};

