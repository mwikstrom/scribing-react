import clsx from "clsx";
import React, { useMemo } from "react";
import { createUseStyles } from "react-jss";
import { LineBreak } from "scribing";
import { flowNode } from "./FlowNodeComponent";
import { makeJssId } from "./internal/utils/make-jss-id";
import { getTextStyleClassNames, TEXT_STYLE_CLASSES } from "./internal/utils/text-style-to-classes";
import { getTextCssProperties } from "./internal/utils/text-style-to-css";

export const LineBreakView = flowNode<LineBreak>((props, ref) => {
    const { node, theme, formattingSymbols } = props;
    const { style: givenStyle } = node;
    const style = useMemo(() => {
        let ambient = theme.getAmbientTextStyle();
        if (givenStyle.link) {
            ambient = ambient.merge(theme.getLinkStyle());
        }
        return ambient.merge(givenStyle);
    }, [givenStyle, theme]);
    const css = useMemo(() => getTextCssProperties(style), [style]);
    const classes = useStyles();
    const className = useMemo(
        () => clsx(classes.root, ...getTextStyleClassNames(style, classes)),
        [style, classes]
    );
    return (
        <span
            ref={ref}
            className={className}
            style={css}
            children={formattingSymbols ? "↵\n" : "\n"}
        />
    );
});

const useStyles = createUseStyles({
    ...TEXT_STYLE_CLASSES,
    root: {
        opacity: 0.5,
        whiteSpace: "pre",
    },
}, {
    generateId: makeJssId("LineBreak"),
});
