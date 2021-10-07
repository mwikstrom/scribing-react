import clsx from "clsx";
import React, { useMemo } from "react";
import { createUseStyles } from "react-jss";
import { ParagraphBreak } from "scribing";
import { flowNode } from "./FlowNodeComponent";
import { useFormattingMarks } from "./FormattingMarksScope";
import { makeJssId } from "./internal/utils/make-jss-id";
import { getTextStyleClassNames, TEXT_STYLE_CLASSES } from "./internal/utils/text-style-to-classes";
import { getTextCssProperties } from "./internal/utils/text-style-to-css";
import { useParagraphTheme } from "./ParagraphThemeScope";

export const ParagraphBreakView = flowNode<ParagraphBreak>((_, ref) => {
    const theme = useParagraphTheme();
    const style = theme.getAmbientTextStyle();
    const css = useMemo(() => getTextCssProperties(style), [style]);
    const classes = useStyles();
    const formattingMarks = useFormattingMarks();
    const className = useMemo(
        () => clsx(
            classes.root,
            !formattingMarks && classes.hidden, 
            ...getTextStyleClassNames(style, classes)
        ),
        [style, formattingMarks, classes]
    );
    return (
        <span
            ref={ref}
            className={className}
            style={css}
            children={"¶"}
        />
    );
});

const useStyles = createUseStyles({
    ...TEXT_STYLE_CLASSES,
    root: {
        opacity: 0.5,
    },
    hidden: {
        opacity: 0,
    },
}, {
    generateId: makeJssId("ParagraphBreak"),
});
