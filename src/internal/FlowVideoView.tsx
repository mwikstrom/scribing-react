import clsx from "clsx";
import React, { useCallback, useMemo, useState, MouseEvent, CSSProperties, useEffect } from "react";
import { FlowVideo } from "scribing";
import { flowNode } from "./FlowNodeComponent";
import { createUseFlowStyles } from "./JssTheming";
import { getTextStyleClassNames, textStyles } from "./utils/text-style-to-classes";
import { getTextCssProperties } from "./utils/text-style-to-css";
import { useParagraphTheme } from "./ParagraphThemeScope";
import { useEditMode } from "./EditModeScope";
import { useFlowCaretContext } from "./FlowCaretScope";
import Color from "color";
import { useIsScrolledIntoView } from "./hooks/use-is-scrolled-into-view";
import { useVideoPosterUrl, useVideoSource } from "./hooks/use-video-source";
import { useBlockSize } from "./BlockSize";
import { mdiAlert, mdiAlertOctagon, mdiLoading, mdiResizeBottomRight } from "@mdi/js";
import { useNativeEventHandler } from "./hooks/use-native-event-handler";
import { useFlowEditorController } from "./FlowEditorControllerScope";
import { useScribingComponents } from "../ScribingComponents";
import { useFlowLocale } from "../FlowLocaleScope";
import Icon from "@mdi/react";

export const FlowVideoView = flowNode<FlowVideo>((props, outerRef) => {
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
    const locale = useFlowLocale();

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

    const { url: videoUrl, ready, broken } = useVideoSource(source);
    const posterUrl = useVideoPosterUrl(source);
    const [videoElem, setVideoElem] = useState<HTMLElement | null>(null);
    const [resizeStart, setResizeStart] = useState<{x:number,y:number,w:number,h:number}|null>(null);
    const [uploadState, setUploadState] = useState<"not_available" | "in_progress" | "failed">();

    const onResizeStart = useCallback((e: React.MouseEvent<unknown>) => {
        if (videoElem && controller) {
            setResizeStart({x: e.screenX, y: e.screenY, w: videoElem.clientWidth, h: videoElem.clientHeight});
        }
    }, [videoElem, controller]);
    const [scale, setScale] = useState(givenScale);

    const [showZoomBox, setShowZoomBox] = useState(false);
    const [scaledDown, setScaledDown] = useState(scale < 1);
    const visible = useIsScrolledIntoView(videoElem);
    
    useEffect(() => {
        if (videoElem) {
            const processElem = () => setScaledDown(
                videoElem.clientWidth < source.width ||
                videoElem.clientHeight < source.height
            );
            const observer = new ResizeObserver(processElem);
            observer.observe(videoElem);
            processElem();
            return () => observer.disconnect();
        } else {
            setScaledDown(scale < 1);
        }
    }, [videoElem, scale, source]);

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
            controller.setVideoScale(scale);
        }
    }, [controller, scale], { capture: true });

    const blockSize = useBlockSize();

    const videoStyle = useMemo<CSSProperties>(() => {
        const { width, height } = source;
        const css: CSSProperties = {
            width: `calc(min(${blockSize}, ${Math.round(width * scale)}px))`,
            aspectRatio: `${width}/${height}`,
        };
        return css;
    }, [blockSize, source.width, source.height, scale]);

    const videoClass = clsx(
        classes.video, 
        scaledDown && visible && ready && !editMode && ImageZoom && classes.videoScaledDown
    );

    const bitmapClass = clsx(
        classes.bitmap,
        visible && ready && classes.bitmapReady,
        videoElem && classes.bitmapBound,
        broken && videoUrl && classes.bitmapBroken,
        !videoUrl && classes.bitmapEmpty,
        uploadState && classes.bitmapUploading,
    );

    const bitmapStyle = useMemo<CSSProperties>(() => {
        const css: CSSProperties = {};
        if (ready && !broken) {
            css.backgroundImage = `url(${videoUrl})`;
            css.backgroundSize = "cover";
        }
        return css;
    }, [videoUrl, broken, ready]);

    const resizeOverlay = editMode && selected && controller && controller.isVideo() && (
        <>
            {!uploadState && (
                <div className={classes.sizeProps}>
                    {Math.round(source.width * scale)} x {Math.round(source.height * scale)}<br/>
                    {(scale * 100).toFixed(1)}%
                </div>
            )}
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
    );

    const uploadOverlay = uploadState && (
        <div className={classes.uploadOverlay}>
            <div className={clsx(classes.uploadBox, classes[`upload_${uploadState}`])}>
                <Icon
                    className={classes.uploadIcon}
                    path={UploadStateIcon[uploadState]}
                    size={0.75}
                    spin={uploadState === "in_progress" ? 1 : 0}
                />
                {locale[`video_upload_${uploadState}`]}
            </div>
        </div>
    );

    useEffect(() => {
        if (!source.upload) {
            setUploadState(undefined);
        } else {
            const promise = controller?.getUploadPromise(source.upload);
            if (!promise) {
                setUploadState("not_available");
            } else {
                let active = true;
                setUploadState("in_progress");
                promise.then(
                    () => {
                        if (active) {
                            setUploadState(undefined);
                        }
                    },
                    () => {
                        if (active) {
                            setUploadState("failed");
                        }
                    },
                );
                return () => void (active = false);
            }
        }
    }, [source.upload, controller]);

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
                        <video
                            ref={setVideoElem}
                            style={videoStyle}
                            src={videoUrl}
                            poster={posterUrl}
                            preload={editMode ? "none" : posterUrl ? "metadata" : "auto"}
                            controls
                            disablePictureInPicture
                            controlsList={editMode ? 
                                "nofullscreen nodownload noremoteplayback" :
                                "nodownload noremoteplayback"
                            }
                        />
                        {uploadOverlay}
                        {resizeOverlay}
                        {/*
                        <span
                            ref={setVideoElem}
                            style={videoStyle}
                            className={videoClass}
                            children={(
                                <>
                                    <video className={bitmapClass} style={bitmapStyle} src={url} controls />
                                    {uploadOverlay}
                                    {resizeOverlay}
                                </>
                            )}
                        />
                        */}
                    </>
                )}
            />
            {showZoomBox && ImageZoom && (
                <ImageZoom
                    sourceUrl={""}
                    sourceWidth={source.width}
                    sourceHeight={source.height}
                    onClose={onHideImageZoom}
                />
            )}
        </>
    );
});

const UploadStateIcon = {
    in_progress: mdiLoading,
    not_available: mdiAlert,
    failed: mdiAlertOctagon,
};

const useStyles = createUseFlowStyles("FlowVideo", ({palette, typography}) => ({
    ...textStyles(palette, typography),
    root: {
        display: "inline",
        position: "relative",
        outlineColor: "transparent",
        outlineStyle: "solid",
        outlineWidth: 2,
        outlineOffset: 4,
    },
    uploadOverlay: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },
    uploadBox: {
        textIndent: "initial",
        fontWeight: "normal",
        backgroundColor: Color(palette.tooltip).fade(0.25).toString(),
        color: palette.tooltipText,
        fontFamily: typography.ui,
        padding: 8,
        border: `1px solid ${palette.tooltipText}`,
        borderRadius: 4,
        fontSize: "0.85rem",
        "&$upload_not_available": {
            backgroundColor: Color(palette.warning).fade(0.25).toString(),
        },
        "&$upload_failed": {
            backgroundColor: Color(palette.error).fade(0.25).toString(),
        },
        display: "flex",
        flexDirection: "row",
        alignItems: "center"
    },
    uploadIcon: {
        paddingRight: 8,
    },
    upload_in_progress: {},
    upload_not_available: {},
    upload_failed: {},
    selected: {
        outlineColor: palette.selection,
    },
    selectedInactive: {
        outlineColor: palette.inactiveSelection,
    },
    video: {
        display: "inline-block",
        verticalAlign: "text-bottom",
        border: "none",
        position: "relative",
        "&$videoScaledDown": {
            cursor: "zoom-in"
        }
    },
    videoScaledDown: {},
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
        textIndent: "initial",
        fontWeight: "normal",
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
