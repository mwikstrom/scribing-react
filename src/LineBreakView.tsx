import clsx from "clsx";
import React, { useMemo } from "react";
import { LineBreak } from "scribing";
import { flowNode } from "./FlowNodeComponent";
import { useFormattingMarks } from "./FormattingMarksScope";
import { createUseFlowStyles } from "./internal/JssTheming";
import { getTextStyleClassNames, textStyles } from "./internal/utils/text-style-to-classes";
import { getTextCssProperties } from "./internal/utils/text-style-to-css";
import { useParagraphTheme } from "./ParagraphThemeScope";

export const LineBreakView = flowNode<LineBreak>((props, ref) => {
    const { node } = props;
    const { style: givenStyle } = node;
    const theme = useParagraphTheme();
    const formattingMarks = useFormattingMarks();
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
            children={formattingMarks ? "↵\n" : "\n"}
        />
    );
});

const useStyles = createUseFlowStyles("LineBreak", ({palette}) => ({
    ...textStyles(palette),
    root: {
        opacity: 0.5,
        whiteSpace: "pre",
    },
}));
