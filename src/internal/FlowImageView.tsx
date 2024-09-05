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
import { useFlowEditorController } from "./FlowEditorControllerScope";
import { useScribingComponents } from "../ScribingComponents";
import { UploadOverlay } from "./UploadOverlay";
import { ResizeOverlay } from "./ResizeOverlay";

export const FlowImageView = flowNode<FlowImage>((props, outerRef) => {
    const { node, selection } = props;
    const { style: givenStyle, source, scale: givenScale } = node;
    const controller = useFlowEditorController();
    const { ImageZoom } = useScribingComponents();
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

    const { url, ready, broken } = useImageSource(source);
    const [imageElem, setImageElem] = useState<HTMLElement | null>(null);
    const [scale, setScale] = useState(givenScale);

    const [showImageZoom, setShowZoomBox] = useState(false);
    const [scaledDown, setScaledDown] = useState(scale < 1);
    const visible = useIsScrolledIntoView(imageElem);
    
    useEffect(() => {
        if (imageElem) {
            const processElem = () => setScaledDown(
                imageElem.clientWidth < source.width ||
                imageElem.clientHeight < source.height
            );
            const observer = new ResizeObserver(processElem);
            observer.observe(imageElem);
            processElem();
            return () => observer.disconnect();
        } else {
            setScaledDown(scale < 1);
        }
    }, [imageElem, scale, source]);

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
        } else if (scaledDown && visible && ready && !editMode) {
            setShowZoomBox(true);
            e.stopPropagation();
        }
    }, [rootElem, editMode, scaledDown, visible, ready]);

    const onHideImageZoom = useCallback(() => setShowZoomBox(false), []);

    const blockSize = useBlockSize();

    const imageStyle = useMemo<CSSProperties>(() => {
        const { width, height } = source;
        const css: CSSProperties = {
            width: `calc(min(${blockSize}, ${Math.round(width * scale)}px))`,
            aspectRatio: `${width}/${height}`,
        };
        return css;
    }, [blockSize, source.width, source.height, scale]);

    const imageClass = clsx(
        classes.image, 
        scaledDown && visible && ready && !editMode && ImageZoom && classes.imageScaledDown
    );

    const bitmapClass = clsx(
        classes.bitmap,
        visible && ready && classes.bitmapReady,
        imageElem && classes.bitmapBound,
        broken && url && classes.bitmapBroken,
        !url && classes.bitmapEmpty,
        source.upload && classes.bitmapUploading,
    );

    const bitmapStyle = useMemo<CSSProperties>(() => {
        const css: CSSProperties = {};
        if (ready && !broken) {
            css.backgroundImage = `url(${url})`;
            css.backgroundSize = "cover";
        }
        return css;
    }, [url, broken, ready]);

    return (
        <>
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
                            className={imageClass}
                            children={(
                                <>
                                    <div className={bitmapClass} style={bitmapStyle}></div>
                                    <UploadOverlay uploadId={source.upload} controller={controller} type="image" />
                                    <ResizeOverlay
                                        source={source}
                                        scale={scale}
                                        selected={selected}
                                        element={imageElem}
                                        setScale={setScale}
                                    />
                                </>
                            )}
                        />
                    </>
                )}
            />
            {showImageZoom && ImageZoom && (
                <ImageZoom
                    sourceUrl={url}
                    sourceWidth={source.width}
                    sourceHeight={source.height}
                    onClose={onHideImageZoom}
                />
            )}
        </>
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
        position: "relative",
        "&$imageScaledDown": {
            cursor: "zoom-in"
        }
    },
    imageScaledDown: {},
    bitmap: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundRepeat: "no-repeat",
        "&$bitmapBound": {
            transition: "opacity ease-out 0.1s",
            opacity: 0,
            "&$bitmapReady": {
                opacity: 1,
                "&$bitmapUploading": {
                    opacity: 0.5,
                }
            }
        },
        "&$bitmapEmpty": {
            background: `repeating-linear-gradient(
                45deg,
                ${Color(palette.subtle).fade(0.85)},
                ${Color(palette.subtle).fade(0.85)} 10px,
                ${Color(palette.subtle).fade(0.98)} 10px,
                ${Color(palette.subtle).fade(0.98)} 20px
            )`,
        },
        "&$bitmapBroken": {
            background: `repeating-linear-gradient(
                45deg,
                ${Color(palette.error).fade(0.85)},
                ${Color(palette.error).fade(0.85)} 10px,
                ${Color(palette.error).fade(0.98)} 10px,
                ${Color(palette.error).fade(0.98)} 20px
            )`,
        }
    },
    bitmapBound: {},
    bitmapReady: {},
    bitmapUploading: {},
    bitmapEmpty: {},
    bitmapBroken: {},
}));
