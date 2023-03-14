import clsx from "clsx";
import React, { useCallback, useMemo, useState, MouseEvent, CSSProperties, useEffect } from "react";
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
import { useImageSource } from "./hooks/use-image-source";
import { useBlockSize } from "./BlockSize";
import { mdiResizeBottomRight } from "@mdi/js";
import { useNativeEventHandler } from "./hooks/use-native-event-handler";
import { useFlowEditorController } from "./FlowEditorControllerScope";

export const FlowImageView = flowNode<FlowImage>((props, outerRef) => {
    const { node, selection } = props;
    const { style: givenStyle, source, scale: givenScale } = node;
    const controller = useFlowEditorController();
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

    const { url, ready, broken } = useImageSource(source);
    const [imageElem, setImageElem] = useState<HTMLElement | null>(null);
    const [resizeStart, setResizeStart] = useState<{x:number,y:number,w:number,h:number}|null>(null);

    const onResizeStart = useCallback((e: React.MouseEvent<unknown>) => {
        if (imageElem && controller) {
            setResizeStart({x: e.screenX, y: e.screenY, w: imageElem.clientWidth, h: imageElem.clientHeight});
        }
    }, [imageElem, controller]);
    const [scale, setScale] = useState(givenScale);

    useEffect(() => {
        setScale(givenScale);
        setResizeStart(null);
    }, [givenScale]);

    useNativeEventHandler(resizeStart ? window : null, "mousemove", (e: MouseEvent) => {
        if (resizeStart) {
            const desiredWidth = resizeStart.w + e.screenX - resizeStart.x;
            const desiredHeight = resizeStart.h + e.screenY - resizeStart.y;
            setScale(
                Math.max(
                    Math.max(0.001, 24 / Math.min(source.width, source.height)), 
                    Math.min(
                        100, 
                        Math.min(
                            desiredWidth / source.width,
                            desiredHeight / source.height
                        )
                    )
                )
            );
        }
        e.preventDefault();
    }, [source.width, source.height], { capture: true });    

    useNativeEventHandler(resizeStart ? window : null, "mouseup", () => {
        setResizeStart(null);
        if (controller) {
            controller.setImageScale(scale);
        }
    }, [controller, scale], { capture: true });

    const visible = useIsScrolledIntoView(imageElem);
    const blockSize = useBlockSize();
    const imageStyle = useMemo<CSSProperties>(() => {
        const { width, height } = source;
        const css: CSSProperties = {
            width: `calc(min(${blockSize}, ${Math.round(width * scale)}px))`,
            aspectRatio: `${width}/${height}`,
        };
        if (ready && !broken) {
            css.backgroundImage = `url(${url})`;
            css.backgroundSize = "cover";
        }
        return css;
    }, [blockSize, source.width, source.height, scale, url, broken, ready]);

    return (
        <span 
            ref={ref}
            className={className}
            style={css}
            contentEditable={false}
            onDoubleClick={onDoubleClick}
            onClick={onClick}
            children={(
                <>
                    <span
                        ref={setImageElem}
                        style={imageStyle}
                        className={clsx(
                            classes.image, 
                            visible && ready && classes.ready,
                            imageElem && classes.bound,
                            broken && url && classes.broken,
                            !url && classes.empty,
                        )}
                        children={editMode && selected && controller && controller.isImage() && (
                            <>
                                <div className={classes.sizeProps}>
                                    {Math.round(source.width * scale)} x {Math.round(source.height * scale)}<br/>
                                    {(scale * 100).toFixed(1)}%
                                </div>
                                <svg
                                    className={classes.resize}
                                    viewBox="0 0 24 24"
                                    onMouseDown={onResizeStart}
                                    children={(
                                        <>
                                            <path fill="#00000030" d="M 4 24 L 24 4 L 24 24 Z"/>
                                            <path fill="#fff" d={mdiResizeBottomRight}/>    
                                        </>
                                    )}
                                />
                            </>
                        )}
                    />
                </>
            )}
        />
    );
});

const useStyles = createUseFlowStyles("FlowImage", ({palette, typography}) => ({
    ...textStyles(palette, typography),
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
        backgroundRepeat: "no-repeat",
        position: "relative",
    },
    bound: {
        transition: "opacity ease-out 0.1s",
        opacity: 0,
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
    sizeProps: {
        position: "absolute",
        top: 4,
        left: 4,
        backgroundColor: Color(palette.tooltip).fade(0.25).toString(),
        color: palette.tooltipText,
        fontFamily: typography.ui,
        fontSize: 10,
        paddingLeft: 8,
        paddingRight: 8,
        textAlign: "center",
        whiteSpace: "nowrap",
    },
    resize: {
        position: "absolute",
        bottom: 0,
        right: 0,
        cursor: "nw-resize",
        width: 24,
        height: 24,
    },
}));
