import clsx from "clsx";
import React, { useMemo } from "react";
import { LineBreak } from "scribing";
import { flowNode } from "./FlowNodeComponent";
import { useFormattingMarks } from "./FormattingMarksScope";
import { createUseFlowStyles } from "./JssTheming";
import { getTextStyleClassNames, textStyles } from "./utils/text-style-to-classes";
import { getTextCssProperties } from "./utils/text-style-to-css";
import { useParagraphTheme } from "./ParagraphThemeScope";
import { useFlowCaretContext } from "./FlowCaretScope";
import { useEditMode } from "./EditModeScope";

export const LineBreakView = flowNode<LineBreak>((props, ref) => {
    const { node, selection } = props;
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
    const css = useMemo(() => getTextCssProperties(style, theme.getAmbientParagraphStyle()), [style, theme]);
    const classes = useStyles();
    const selected = selection === true;
    const editMode = useEditMode();
    const { native: nativeSelection } = useFlowCaretContext();
    const className = clsx(
        classes.root,
        ...getTextStyleClassNames(style, classes),
        selected && !nativeSelection && (editMode === "inactive" ? classes.selectedInactive : classes.selected),
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
    selected: {
        backgroundColor: palette.selection,
        color: palette.selectionText,
    },
    selectedInactive: {
        backgroundColor: palette.inactiveSelection,
        color: palette.inactiveSelectionText,
    },
}));
