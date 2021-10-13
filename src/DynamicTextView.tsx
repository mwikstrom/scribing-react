import clsx from "clsx";
import React, { MouseEvent, useCallback, useEffect, useMemo, useState } from "react";
import { DynamicText } from "scribing";
import { createUseFlowStyles } from "./internal/JssTheming";
import { getTextCssProperties } from "./internal/utils/text-style-to-css";
import { flowNode } from "./FlowNodeComponent";
import { getTextStyleClassNames, textStyles } from "./internal/utils/text-style-to-classes";
import { useObservedScript } from "scripthost-react";
import { useParagraphTheme } from "./ParagraphThemeScope";
import { useFlowLocale } from ".";
import { useShowTip } from "./internal/TooltipScope";

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
    const value = useMemo(() => {
        const { result, ready, error } = evaluated;
        if (error) {            
            return locale.script_error;
        } else if (result !== void(0) || ready) {
            return String(result);
        } else {
            return null;
        }
    }, [evaluated, locale]);
    
    const [hover, setHover] = useState(false);
    const onMouseEnter = useCallback(() => setHover(true), [setHover]);
    const onMouseLeave = useCallback(() => setHover(false), [setHover]);

    useEffect(() => {
        const { error } = evaluated;
        if (error && rootElem && hover) {
            return showTip(rootElem, error.message);
        }
    }, [evaluated, rootElem, hover]);

    const className = useMemo(() => clsx(
        classes.root, 
        !evaluated.ready && classes.pending,
        evaluated.error !== null && classes.error,
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
            children={value}
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
    error: {
        display: "inline-block",
        color: palette.error,
        outlineStyle: "dashed",
        outlineWidth: 1,
        outlineColor: palette.error,
        outlineOffset: "0.2rem"
    },
    pending: {}, // TODO: Style pending
}));
