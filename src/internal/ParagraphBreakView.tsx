import clsx from "clsx";
import React, { useMemo } from "react";
import { ParagraphBreak } from "scribing";
import { flowNode } from "./FlowNodeComponent";
import { useFormattingMarks } from "./FormattingMarksScope";
import { createUseFlowStyles } from "./JssTheming";
import { getTextStyleClassNames, textStyles } from "./utils/text-style-to-classes";
import { getTextCssProperties } from "./utils/text-style-to-css";
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
            contentEditable={false}
        />
    );
});

const useStyles = createUseFlowStyles("ParagraphBreak", ({palette}) => ({
    ...textStyles(palette),
    root: {
        opacity: 0.5,
    },
    hidden: {
        opacity: 0,
    },
}));
