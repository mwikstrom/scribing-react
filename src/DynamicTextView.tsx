import clsx from "clsx";
import React, { MouseEvent, useCallback, useMemo } from "react";
import { DynamicText } from "scribing";
import { createUseFlowStyles } from "./internal/JssTheming";
import { getTextCssProperties } from "./internal/utils/text-style-to-css";
import { flowNode } from "./FlowNodeComponent";
import { getTextStyleClassNames, textStyles } from "./internal/utils/text-style-to-classes";
import { useObservedScript } from "scripthost-react";
import { useParagraphTheme } from "./ParagraphThemeScope";

export const DynamicTextView = flowNode<DynamicText>((props, ref) => {
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
    
    const evaluated = useObservedScript(expression);
    const value = useMemo(() => {
        const { result, ready, error } = evaluated;
        if (ready && error === null) {
            return String(result);
        } else {
            return "";
        }
    }, [evaluated]);

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
        />
    );
});

const useStyles = createUseFlowStyles("DynamicText", ({palette}) => ({
    ...textStyles(palette),
    root: {
        whiteSpace: "pre-wrap", // Preserve white space, wrap as needed
    },
    error: {}, // TODO: Style error
    pending: {}, // TODO: Style pending
}));
