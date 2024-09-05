import React, { useCallback, useState, MouseEvent } from "react";
import { ImageSource, VideoSource } from "scribing";
import { createUseFlowStyles } from "./JssTheming";
import { useEditMode } from "./EditModeScope";
import Color from "color";
import { mdiResizeBottomRight } from "@mdi/js";
import { useNativeEventHandler } from "./hooks/use-native-event-handler";
import { useFlowEditorController } from "./FlowEditorControllerScope";

export interface ResizeOverlayProps {
    source: ImageSource | VideoSource;
    scale: number;
    selected: boolean;
    element: HTMLElement | null;
    setScale(value: number): void;
}

export const ResizeOverlay = (props: ResizeOverlayProps): JSX.Element | null => {
    const { source, scale, selected, element, setScale } = props;
    const controller = useFlowEditorController();
    const classes = useStyles();
    const editMode = useEditMode();
    const [resizeStart, setResizeStart] = useState<{x:number,y:number,w:number,h:number}|null>(null);

    const onResizeStart = useCallback((e: React.MouseEvent<unknown>) => {
        if (element && controller) {
            setResizeStart({x: e.screenX, y: e.screenY, w: element.clientWidth, h: element.clientHeight});
            e.preventDefault();
            e.stopPropagation();
        }
    }, [element, controller]);   

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
    }, [source.width, source.height, setScale], { capture: false });    

    useNativeEventHandler(resizeStart ? window : null, "mouseup", () => {
        setResizeStart(null);
        if (controller) {
            controller.setImageScale(scale);
        }
    }, [controller, scale], { capture: true });

    if (!editMode || !selected || !controller) {
        return null;
    }

    return (
        <>
            {!source.upload && (
                <div className={classes.sizeProps}>
                    {Math.round(source.width * scale)} x {Math.round(source.height * scale)}<br/>
                    {(scale * 100).toFixed(1)}%
                </div>
            )}
            <svg
                className={classes.resizeHandle}
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
};

const useStyles = createUseFlowStyles("ResizeOverlay", ({palette, typography}) => ({
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
    resizeHandle: {
        position: "absolute",
        bottom: 0,
        right: 0,
        cursor: "nw-resize",
        width: 24,
        height: 24,
    },
}));
