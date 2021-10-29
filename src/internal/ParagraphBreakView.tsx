import clsx from "clsx";
import React, { useCallback, useMemo, useState } from "react";
import { ParagraphBreak } from "scribing";
import { flowNode } from "./FlowNodeComponent";
import { useFormattingMarks } from "./FormattingMarksScope";
import { createUseFlowStyles } from "./JssTheming";
import { getTextStyleClassNames, textStyles } from "./utils/text-style-to-classes";
import { getTextCssProperties } from "./utils/text-style-to-css";
import { useParagraphTheme } from "./ParagraphThemeScope";
import { useNativeEventHandler } from "./hooks/use-native-event-handler";

export const ParagraphBreakView = flowNode<ParagraphBreak>(({singleNodeInPara}, setOuterRef) => {
    const theme = useParagraphTheme();
    const style = theme.getAmbientTextStyle();
    const css = useMemo(() => getTextCssProperties(style, theme.getAmbientParagraphStyle()), [style, theme]);
    const classes = useStyles();
    const formattingMarks = useFormattingMarks();
    const [innerRef, setInnerRef] = useState<HTMLElement | null>(null);
    const setRef = useCallback((elem: HTMLElement | null) => {
        setInnerRef(elem);
        setOuterRef(elem);
    }, [setInnerRef, setOuterRef]);
    
    const className = useMemo(
        () => clsx(
            classes.root,
            !formattingMarks && classes.hidden, 
            ...getTextStyleClassNames(style, classes)
        ),
        [style, formattingMarks, classes]
    );

    // It's actually never editable, but we need to fake it
    // to allow caret to move vertically into an empty paragraph - but not
    // when the caret is placed just before the break node, to make it possible
    // to move the caret over the break node.
    const checkIsCaretBefore = useCallback(() => {
        const domSelection = document.getSelection();
        if (innerRef === null || domSelection === null || !domSelection.isCollapsed) {
            return false;
        }
        const { focusNode, focusOffset } = domSelection;
        return (
            focusNode !== null && 
            focusNode === innerRef.parentNode && 
            focusNode.childNodes.item(focusOffset) === innerRef
        );
    }, [innerRef]);
    const [isCaretBefore, setIsCaretBefore] = useState(checkIsCaretBefore);
    const contentEditable = !!singleNodeInPara &&!isCaretBefore;
    useNativeEventHandler(
        document,
        "selectionchange", 
        () => setIsCaretBefore(checkIsCaretBefore()), 
        [setIsCaretBefore, checkIsCaretBefore]
    );

    return (
        <span
            ref={setRef}
            className={className}
            style={css}
            children={"¶"}
            contentEditable={contentEditable}
            suppressContentEditableWarning={true}
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
