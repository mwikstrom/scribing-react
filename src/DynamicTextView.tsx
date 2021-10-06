import clsx from "clsx";
import React, { useMemo } from "react";
import { createUseStyles } from "react-jss";
import { DynamicText } from "scribing";
import { makeJssId } from "./internal/utils/make-jss-id";
import { getTextCssProperties } from "./internal/utils/text-style-to-css";
import { flowNode } from "./FlowNodeComponent";
import { getTextStyleClassNames, TEXT_STYLE_CLASSES } from "./internal/utils/text-style-to-classes";
import { useObservedScript } from "scripthost-react";

export const DynamicTextView = flowNode<DynamicText>((props, ref) => {
    const { node, theme } = props;
    const { expression, style: givenStyle } = node;
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
    return (
        <span
            ref={ref}
            contentEditable={false}
            className={className}
            style={css}
            children={value}
        />
    );
});

const useStyles = createUseStyles({
    ...TEXT_STYLE_CLASSES,
    root: {
        whiteSpace: "pre-wrap", // Preserve white space, wrap as needed
    },
    error: {}, // TODO: Style error
    pending: {}, // TODO: Style pending
}, {
    generateId: makeJssId("DynamicText"),
});
