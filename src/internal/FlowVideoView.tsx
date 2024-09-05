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
import { useBlockSize } from "./BlockSize";
import { mdiResizeBottomRight } from "@mdi/js";
import { useNativeEventHandler } from "./hooks/use-native-event-handler";
import { useFlowEditorController } from "./FlowEditorControllerScope";
import { useVerifiedImageUrl } from "./hooks/use-verified-image";
import { useVideoSourceUrl } from "./hooks/use-video-source";
import { UploadOverlay } from "./UploadOverlay";

export const FlowVideoView = flowNode<FlowVideo>((props, outerRef) => {
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

    const rootClassName = clsx(
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

    const verifiedPosterUrl = useVerifiedImageUrl(source.poster || "");
    const posterUrl = verifiedPosterUrl || (source.placeholder && `data:;base64,${source.placeholder}`);
    const videoUrl = useVideoSourceUrl(source);
    const isVoid = !videoUrl && !posterUrl;
    const [isBroken, setBroken] = useState(false);
    const onError = useCallback(() => setBroken(!!videoUrl), [videoUrl]);
    const [wrapperElem, setWrapperElem] = useState<HTMLElement | null>(null);
    const [resizeStart, setResizeStart] = useState<{x:number,y:number,w:number,h:number}|null>(null);

    const onResizeStart = useCallback((e: React.MouseEvent<unknown>) => {
        if (wrapperElem && controller) {
            setResizeStart({x: e.screenX, y: e.screenY, w: wrapperElem.clientWidth, h: wrapperElem.clientHeight});
        }
    }, [wrapperElem, controller]);
    const [scale, setScale] = useState(givenScale);

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

    useEffect(() => {
        setBroken(false);
    }, [videoUrl]);

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

    const sizeStyle = useMemo<CSSProperties>(() => {
        const { width, height } = source;
        const css: CSSProperties = {
            width: `calc(min(${blockSize}, ${Math.round(width * scale)}px))`,
            aspectRatio: `${width}/${height}`,
        };
        return css;
    }, [blockSize, source.width, source.height, scale]);

    const stateOverlay = (isVoid || isBroken) && (
        <div className={clsx(classes.stateOverlay, isBroken ? classes.stateBroken : classes.stateVoid)} />
    );

    const videoClassName = clsx(classes.video, stateOverlay && classes.videoHidden);

    const resizeOverlay = editMode && selected && controller && controller.isVideo() && (
        <>
            {!source.upload && (
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

    return (
        <span 
            ref={ref}
            className={rootClassName}
            style={css}
            contentEditable={false}
            onDoubleClick={onDoubleClick}
            onClick={onClick}
            children={(
                <>
                    <span
                        ref={setWrapperElem}
                        style={sizeStyle}
                        className={classes.wrapper}
                        children={(
                            <>
                                <video
                                    className={videoClassName}
                                    style={sizeStyle}
                                    src={videoUrl}
                                    onError={onError}
                                    poster={posterUrl}
                                    preload={posterUrl ? "metadata" : "auto"}
                                    controls={videoUrl ? true : undefined}
                                    disablePictureInPicture
                                    controlsList={editMode ? 
                                        "nofullscreen nodownload noremoteplayback" :
                                        "nodownload noremoteplayback"
                                    }
                                />
                                {stateOverlay}
                                <UploadOverlay uploadId={source.upload} controller={controller} type="video" />
                                {resizeOverlay}
                            </>
                        )}
                    />
                </>
            )}
        />
    );
});

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
    selected: {
        outlineColor: palette.selection,
    },
    selectedInactive: {
        outlineColor: palette.inactiveSelection,
    },
    wrapper: {
        display: "inline-block",
        verticalAlign: "text-bottom",
        border: "none",
        position: "relative",
    },
    video: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        "&$videoHidden": {
            opacity: 0,
        }
    },
    videoHidden: {},
    stateOverlay: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundRepeat: "no-repeat",
        "&$stateVoid": {
            background: `repeating-linear-gradient(
                45deg,
                ${Color(palette.subtle).fade(0.85)},
                ${Color(palette.subtle).fade(0.85)} 10px,
                ${Color(palette.subtle).fade(0.98)} 10px,
                ${Color(palette.subtle).fade(0.98)} 20px
            )`,
        },
        "&$stateBroken": {
            background: `repeating-linear-gradient(
                45deg,
                ${Color(palette.error).fade(0.85)},
                ${Color(palette.error).fade(0.85)} 10px,
                ${Color(palette.error).fade(0.98)} 10px,
                ${Color(palette.error).fade(0.98)} 20px
            )`,
        }
    },
    stateVoid: {},
    stateBroken: {},
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
