import clsx from "clsx";
import React, { useCallback, useMemo, useState, MouseEvent, CSSProperties, useEffect } from "react";
import { FlowImage } from "scribing";
import { flowNode } from "./FlowNodeComponent";
import { createUseFlowStyles } from "./JssTheming";
import { useEditMode } from "./EditModeScope";
import Color from "color";
import { useIsScrolledIntoView } from "./hooks/use-is-scrolled-into-view";
import { useImageSource } from "./hooks/use-image-source";
import { useScribingComponents } from "../ScribingComponents";
import { FlowMediaView } from "./FlowMediaView";

export const FlowImageView = flowNode<FlowImage>((props, outerRef) => {
    const { node, selection } = props;
    const { source, scale: givenScale } = node;
    const { ImageZoom } = useScribingComponents();
    const classes = useStyles();
    const editMode = useEditMode();
    const [scale, setScale] = useState(givenScale);
    const { url, ready, broken } = useImageSource(source);
    const [imageElem, setImageElem] = useState<HTMLElement | null>(null);
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
        if (scaledDown && visible && ready && !editMode) {
            setShowZoomBox(true);
            e.stopPropagation();
        }
    }, [editMode, scaledDown, visible, ready]);

    const onHideImageZoom = useCallback(() => setShowZoomBox(false), []);

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
            <FlowMediaView
                node={node}
                selection={selection}
                outerRef={outerRef}
                scale={scale}
                setScale={setScale}
                children={<div className={bitmapClass} style={bitmapStyle}></div>}
                wrapperClassName={imageClass}
                wrapperRef={setImageElem}
                onClick={onClick}
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

const useStyles = createUseFlowStyles("FlowImage", ({palette}) => ({
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
