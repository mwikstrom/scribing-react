import clsx from "clsx";
import React, { useCallback, useMemo, useState, MouseEvent, FC, RefCallback, ReactNode } from "react";
import { EmptyMarkup, EndMarkup, StartMarkup } from "scribing";
import { flowNode, FlowNodeComponentProps } from "./FlowNodeComponent";
import { createUseFlowStyles } from "./JssTheming";
import { getTextCssProperties } from "./utils/text-style-to-css";
import { useParagraphTheme } from "./ParagraphThemeScope";
import { useFlowCaretContext } from "./FlowCaretScope";
import { useEditMode } from "./EditModeScope";

export const StartMarkupView = flowNode<StartMarkup>((props, outerRef) => <MarkupView {...props} outerRef={outerRef}/>);
export const EmptyMarkupView = flowNode<EmptyMarkup>((props, outerRef) => <MarkupView {...props} outerRef={outerRef}/>);
export const EndMarkupView = flowNode<EndMarkup>((props, outerRef) => <MarkupView {...props} outerRef={outerRef}/>);

interface MarkupViewProps extends Omit<FlowNodeComponentProps<StartMarkup | EmptyMarkup | EndMarkup>, "ref"> {
    outerRef: RefCallback<HTMLElement>;
}

const REPLACEMENTS = new WeakMap<StartMarkup | EmptyMarkup | EndMarkup, ReactNode>();
export const setMarkupReplacement = (
    placeholder: EmptyMarkup,
    replacement: ReactNode
): void => void(REPLACEMENTS.set(placeholder, replacement));

const MarkupView: FC<MarkupViewProps> = props => {
    const { node, opposingTag, selection, outerRef } = props;
    const { style: givenStyle, tag } = node;
    const attr = node instanceof EndMarkup ? [] : Array.from(node.attr);
    const replacement = REPLACEMENTS.get(node) ?? null;
    const theme = useParagraphTheme();
    const style = useMemo(() => {
        let ambient = theme.getAmbientTextStyle();
        if (givenStyle.link) {
            ambient = ambient.merge(theme.getLinkStyle());
        }
        return ambient.merge(givenStyle);
    }, [givenStyle, theme]);
    const css = useMemo(() => {
        const { 
            fontSize: styledFontSize, 
            verticalAlign
        } = getTextCssProperties(style, theme.getAmbientParagraphStyle());
        const MAX_FONT_SIZE = "0.75rem";
        const fontSize = styledFontSize ? `calc(min(${styledFontSize}, ${MAX_FONT_SIZE}))` : MAX_FONT_SIZE;
        return { fontSize, verticalAlign };
    }, [style, theme]);
    const classes = useStyles();
    const selected = selection === true;
    const editMode = useEditMode();
    const { native: nativeSelection } = useFlowCaretContext();
    const className = clsx(
        classes.root,
        selected && !nativeSelection && (editMode === "inactive" ? classes.selectedInactive : classes.selected),
        node instanceof StartMarkup && classes.startTag,
        node instanceof EndMarkup && classes.endTag,
        node instanceof EmptyMarkup && classes.emptyTag,
        (node instanceof StartMarkup || node instanceof EndMarkup) && !opposingTag && classes.broken,
    );
    const [rootElem, setRootElem] = useState<HTMLElement | null>(null);
    const ref = useCallback((dom: HTMLElement | null) => {
        outerRef(dom);
        setRootElem(dom);
    }, [outerRef]);
    const onClick = useCallback((e: MouseEvent<HTMLElement>) => {        
        const domSelection = document.getSelection();
        if (domSelection && rootElem && !e.ctrlKey && editMode) {
            const { parentElement } = rootElem;
            if (parentElement) {
                let childOffset = 0;
                for (let prev = rootElem.previousSibling; prev; prev = prev.previousSibling) {
                    ++childOffset;
                }
                const { left, width } = rootElem.getBoundingClientRect();
                if (e.clientX >= left + width / 2) {
                    ++childOffset;
                }
                if (e.shiftKey) {
                    domSelection.extend(parentElement, childOffset);
                } else {
                    domSelection.setBaseAndExtent(parentElement, childOffset, parentElement, childOffset);
                }
                e.stopPropagation();
            }
        }
    }, [rootElem, editMode]);
    const onDoubleClick = useCallback((e: MouseEvent<HTMLElement>) => {        
        const domSelection = document.getSelection();
        if (domSelection && rootElem) {
            if (domSelection.rangeCount === 0) {
                domSelection.addRange(document.createRange());
            }
            domSelection.getRangeAt(0).selectNode(rootElem);
            e.stopPropagation();
        }
    }, [rootElem]);
    return editMode ? (
        <span
            ref={ref}
            className={className}
            style={css}
            contentEditable={false}
            spellCheck={false}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            children={
                <>
                    {tag}
                    {attr.map(([key, value]) => (
                        <span key={key}>
                            {` ${key}=${value}`}
                        </span>
                    ))}
                </>
            }
        />
    ) : replacement ? <>{replacement}</> : null;
};

const useStyles = createUseFlowStyles("Markup", ({palette, typography}) => ({
    root: {
        display: "inline-block",
        whiteSpace: "pre",
        fontFamily: typography.monospace,
        fontWeight: "normal",
        color: palette.text,
        border: `1px solid ${palette.subtle}`,
        padding: "0.2rem 0.4rem",
        marginLeft: "0.1rem",
        marginRight: "0.2rem",
        cursor: "default",
        borderBottomWidth: 2,
        textIndent: 0,
    },
    broken: {
        color: palette.error,
        borderColor: palette.error,
    },
    startTag: {
        borderTopRightRadius: "1em",
        borderBottomRightRadius: "1em",
        paddingRight: "0.6rem",
    },
    endTag: {
        borderTopLeftRadius: "1em",
        borderBottomLeftRadius: "1em",
        paddingLeft: "0.6rem",
    },
    emptyTag: {
        borderRadius: "0.4em",
    },
    selected: {
        backgroundColor: palette.selection,
        color: palette.selectionText,
        borderColor: palette.selectionText,
        outline: `1px solid ${palette.selection}`,
    },
    selectedInactive: {
        backgroundColor: palette.inactiveSelection,
        color: palette.inactiveSelectionText,
        borderColor: palette.inactiveSelectionText,
        outline: `1px solid ${palette.inactiveSelection}`,
    },
}));
