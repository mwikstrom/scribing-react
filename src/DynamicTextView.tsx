import clsx from "clsx";
import React, { MouseEvent, useCallback, useEffect, useMemo, useState } from "react";
import { DynamicText } from "scribing";
import { createUseFlowStyles } from "./internal/JssTheming";
import { getTextCssProperties } from "./internal/utils/text-style-to-css";
import { flowNode } from "./FlowNodeComponent";
import { getTextStyleClassNames, textStyles } from "./internal/utils/text-style-to-classes";
import { useObservedScript } from "scripthost-react";
import { useParagraphTheme } from "./ParagraphThemeScope";
import { useEditMode, useFlowLocale } from ".";
import { useShowTip } from "./internal/TooltipScope";
import Icon from "@mdi/react";
import { mdiLoading } from "@mdi/js";

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
    
    const css = useMemo(() => getTextCssProperties(style), [style]);
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
    const value = useMemo(() => {
        const { result, ready, error } = evaluated;
        if (empty) {
            return !editMode ? "" : expression ? locale.void_result : locale.void_script;
        } else if (error) {            
            return locale.script_error;
        } else if (result !== void(0) || ready) {
            return String(result);
        } else {
            return null;
        }
    }, [evaluated, locale, empty, editMode]);
    
    const [hover, setHover] = useState(false);
    const onMouseEnter = useCallback(() => setHover(true), [setHover]);
    const onMouseLeave = useCallback(() => setHover(false), [setHover]);

    useEffect(() => {
        const { error } = evaluated;
        if (error && rootElem && hover && !empty) {
            return showTip(rootElem, error.message);
        }
    }, [evaluated, rootElem, hover, empty]);

    const className = useMemo(() => clsx(
        classes.root, 
        !evaluated.ready && classes.pending,
        evaluated.error !== null && !empty && classes.error,
        !!editMode && empty && classes.empty,
        ...getTextStyleClassNames(style, classes)
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
            style={css}
            children={evaluated.ready ? value : <Icon path={mdiLoading} size={0.5} spin={0.5}/>}
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
