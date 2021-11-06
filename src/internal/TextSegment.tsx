import clsx from "clsx";
import React, { FC, useEffect, useMemo, useState } from "react";
import { TextStyle } from "scribing";
import { getTextCssProperties } from "./utils/text-style-to-css";
import { createUseFlowStyles } from "./JssTheming";
import { getTextStyleClassNames, textStyles } from "./utils/text-style-to-classes";
import { useParagraphTheme } from "./ParagraphThemeScope";
import { useFlowCaretContext } from "./FlowCaretScope";
import { useEditMode } from "./EditModeScope";

export interface TextSegmentProps {
    text: string;
    style: TextStyle;
    selected?: boolean;
}

export const TextSegment: FC<TextSegmentProps> = props => {
    const { text, selected, style: givenStyle } = props;
    const theme = useParagraphTheme();
    const style = useMemo(() => {
        let ambient = theme.getAmbientTextStyle();
        if (givenStyle.link) {
            ambient = ambient.merge(theme.getLinkStyle());
        }
        return ambient.merge(givenStyle);
    }, [givenStyle, theme]);
    const css = useMemo(() => getTextCssProperties(style, theme.getAmbientParagraphStyle()), [style, theme]);
    const classes = useStyles();
    const editMode = useEditMode();
    const { native: nativeSelection } = useFlowCaretContext();
    const className = clsx(
        classes.root, 
        ...getTextStyleClassNames(style, classes),
        selected && !nativeSelection && (editMode === "inactive" ? classes.selectedInactive : classes.selected),
    );

    // Enable spell checker only after text has been idle for a while and editing is active
    const [spellCheck, setSpellCheck] = useState(false);
    useEffect(() => {
        setSpellCheck(false);
        if (style.spellcheck && editMode === true) {
            const timeout = setTimeout(() => setSpellCheck(true), 500);
            return () => clearTimeout(timeout);
        }
    }, [text, style.spellcheck, editMode]);

    return (
        <span
            className={className}
            style={css}
            children={text || "\u200b"}
            spellCheck={spellCheck}
        />
    );
};

const useStyles = createUseFlowStyles("TextSegment", ({palette}) => ({
    ...textStyles(palette),
    root: {
        whiteSpace: "pre-wrap", // Preserve white space, wrap as needed
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
