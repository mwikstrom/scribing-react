import clsx from "clsx";
import React, { useMemo } from "react";
import { createUseStyles } from "react-jss";
import { ParagraphBreak } from "scribing";
import { flowNode } from "./FlowNodeComponent";
import { makeJssId } from "./internal/utils/make-jss-id";
import { getTextStyleClassNames, TEXT_STYLE_CLASSES } from "./internal/utils/text-style-to-classes";
import { getTextCssProperties } from "./internal/utils/text-style-to-css";

export const ParagraphBreakView = flowNode<ParagraphBreak>((props, ref) => {
    const { theme, formattingMarks } = props;
    const style = theme.getAmbientTextStyle();
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
            children={formattingMarks ? "¶" : null}
        />
    );
});

const useStyles = createUseStyles({
    ...TEXT_STYLE_CLASSES,
    root: {
        opacity: 0.5,
    },
}, {
    generateId: makeJssId("ParagraphBreak"),
});
