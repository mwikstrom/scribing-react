import clsx from "clsx";
import React, { useEffect, useMemo, useState } from "react";
import { createUseStyles } from "react-jss";
import { DynamicText } from "scribing";
import { makeJssId } from "./internal/utils/make-jss-id";
import { getTextCssProperties } from "./internal/utils/text-style-to-css";
import { flowNode } from "./FlowNodeComponent";
import { getTextStyleClassNames, TEXT_STYLE_CLASSES } from "./internal/utils/text-style-to-classes";

export const DynamicTextView = flowNode<DynamicText>((props, ref) => {
    const { node, theme, evaluate } = props;
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
    const rawValue = useMemo(() => evaluate(expression), [expression, evaluate]);
    const [intermediateValue, setIntermediateValue] = useState(rawValue);
    const value = useMemo(() => {
        if (intermediateValue === void(0) || intermediateValue instanceof Promise) {
            return "";
        } else {
            return String(intermediateValue);
        }
    }, [intermediateValue]);
    const className = useMemo(
        () => clsx(classes.root, ...getTextStyleClassNames(style, classes)),
        [style, classes]
    );

    useEffect(() => {
        if (intermediateValue instanceof Promise) {
            let active = true;
            intermediateValue.then(result => {
                if (active) {
                    setIntermediateValue(result);
                }
            });
            return () => { active = false; };
        }
    }, [intermediateValue]);

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
}, {
    generateId: makeJssId("DynamicText"),
});
