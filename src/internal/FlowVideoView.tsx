import clsx from "clsx";
import React, { useCallback, useState, useEffect } from "react";
import { FlowVideo } from "scribing";
import { flowNode } from "./FlowNodeComponent";
import { createUseFlowStyles } from "./JssTheming";
import { useEditMode } from "./EditModeScope";
import Color from "color";
import { useVerifiedImageUrl } from "./hooks/use-verified-image";
import { useVideoSourceUrl } from "./hooks/use-video-source";
import { FlowMediaView } from "./FlowMediaView";
import { useMediaSize } from "./hooks/use-media-size";

export const FlowVideoView = flowNode<FlowVideo>((props, outerRef) => {
    const { node, selection } = props;
    const { source, scale: givenScale } = node;
    const classes = useStyles();
    const editMode = useEditMode();
    const [scale, setScale] = useState(givenScale);
    const verifiedPosterUrl = useVerifiedImageUrl(source.poster || "");
    const posterUrl = verifiedPosterUrl || (source.placeholder && `data:;base64,${source.placeholder}`);
    const videoUrl = useVideoSourceUrl(source);
    const isVoid = !videoUrl && !posterUrl;
    const [isBroken, setBroken] = useState(false);
    const onError = useCallback(() => setBroken(!!videoUrl), [videoUrl]);
    const sizeStyle = useMediaSize(source, scale);

    const stateOverlay = (isVoid || isBroken) && (
        <div className={clsx(classes.stateOverlay, isBroken ? classes.stateBroken : classes.stateVoid)} />
    );

    useEffect(() => {
        setBroken(false);
    }, [videoUrl]);

    return (
        <FlowMediaView node={node} selection={selection} outerRef={outerRef} scale={scale} setScale={setScale}>
            <video
                className={clsx(classes.root, stateOverlay && classes.videoHidden)}
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
        </FlowMediaView>
    );
});

const useStyles = createUseFlowStyles("FlowVideo", ({palette}) => ({
    root: {
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
}));
