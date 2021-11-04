import clsx from "clsx";
import React, { useCallback, useMemo, useState, MouseEvent, CSSProperties } from "react";
import { FlowImage } from "scribing";
import { flowNode } from "./FlowNodeComponent";
import { createUseFlowStyles } from "./JssTheming";
import { getTextStyleClassNames, textStyles } from "./utils/text-style-to-classes";
import { getTextCssProperties } from "./utils/text-style-to-css";
import { useParagraphTheme } from "./ParagraphThemeScope";
import { useEditMode } from "./EditModeScope";
import { useFlowCaretContext } from "./FlowCaretScope";
import Color from "color";
import { useIsScrolledIntoView } from "./hooks/use-is-scrolled-into-view";

export const FlowImageView = flowNode<FlowImage>((props, outerRef) => {
    const { node, selection } = props;
    const { style: givenStyle, source } = node;
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
    const selected = selection === true;
    const editMode = useEditMode();
    const { native: nativeSelection } = useFlowCaretContext();
    const className = clsx(
        classes.root,
        ...getTextStyleClassNames(style, classes),
        selected && !nativeSelection && (editMode === "inactive" ? classes.selectedInactive : classes.selected),
    );

    const [rootElem, setRootElem] = useState<HTMLElement | null>(null);
    const ref = useCallback((dom: HTMLElement | null) => {
        outerRef(dom);
        setRootElem(dom);
    }, [outerRef]);
    
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

    const imageStyle = useMemo<CSSProperties>(() => {
        const { width, height } = source;
        return {
            width: `calc(min(100%, ${width}px))`,
            aspectRatio: `${width}/${height}`,
        };
    }, [source.width, source.height]);

    // TODO: THIS IS JUST TEMPORARY! url, broken + pending shall be assigned real stuff...
    const url = source.placeholder ? `data:;base64,${source.placeholder}` : source.url;
    const broken = url === "broken";
    const visible = useIsScrolledIntoView(rootElem);
    const ready = visible;

    return (
        <span 
            ref={ref}
            className={className}
            style={css}
            contentEditable={false}
            onDoubleClick={onDoubleClick}
            onClick={onClick}
            children={url && !broken ? (
                <img
                    className={clsx(classes.image, ready && classes.ready)}
                    src={url}
                    style={imageStyle}
                />
            ) : (
                <span
                    className={clsx(
                        classes.image, 
                        ready && classes.ready,
                        broken ? classes.broken : classes.empty
                    )}
                    style={imageStyle}
                />
            )}
        />
    );
});

const useStyles = createUseFlowStyles("FlowImage", ({palette}) => ({
    ...textStyles(palette),
    root: {
        display: "inline",
        position: "relative",
        outlineColor: "transparent",
        outlineStyle: "solid",
        outlineWidth: 2,
        outlineOffset: 4,
    },
    selected: {
        outlineColor: palette.selection,
    },
    selectedInactive: {
        outlineColor: palette.inactiveSelection,
    },
    image: {
        display: "inline-block",
        verticalAlign: "text-bottom",
        border: "none",
        opacity: 0,
        transition: "opacity ease-out 1s",
    },
    ready: {
        opacity: 1,
    },
    empty: {
        background: `repeating-linear-gradient(
            45deg,
            ${Color(palette.subtle).fade(0.85)},
            ${Color(palette.subtle).fade(0.85)} 10px,
            ${Color(palette.subtle).fade(0.98)} 10px,
            ${Color(palette.subtle).fade(0.98)} 20px
        )`,
    },
    broken: {
        background: `repeating-linear-gradient(
            45deg,
            ${Color(palette.error).fade(0.85)},
            ${Color(palette.error).fade(0.85)} 10px,
            ${Color(palette.error).fade(0.98)} 10px,
            ${Color(palette.error).fade(0.98)} 20px
        )`,
    },
}));
