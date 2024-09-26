import clsx from "clsx";
import React, { useState, useEffect } from "react";
import { createUseFlowStyles } from "./JssTheming";
import Color from "color";
import { mdiAlert, mdiAlertOctagon, mdiLoading } from "@mdi/js";
import { useFlowLocale } from "../FlowLocaleScope";
import Icon from "@mdi/react";
import { FlowEditorController } from "../FlowEditorController";

export interface UploadOverlayProps {
    uploadId?: string | null;
    controller?: FlowEditorController | null;
    type: "video" | "image";
}

export const UploadOverlay = (props: UploadOverlayProps) : JSX.Element | null => {
    const { uploadId, controller, type } = props;
    const [uploadState, setUploadState] = useState<"not_available" | "in_progress" | "failed">();
    const [progressMessage, setProgressMessage] = useState("");
    const classes = useStyles();
    const locale = useFlowLocale();

    useEffect(() => {
        if (!uploadId) {
            setUploadState(undefined);
        } else {
            const promise = controller?.getUploadPromise(uploadId);
            const disposeProgressObserver = controller?.observeUpload(
                uploadId,
                ({ message }) => setProgressMessage(message)
            );
            if (!promise) {
                setUploadState("not_available");
                setProgressMessage("");
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
                            setProgressMessage("");
                        }
                    },
                );
                return () => {
                    active = false;
                    disposeProgressObserver && disposeProgressObserver();
                };
            }
        }
    }, [uploadId, controller]);

    if (!uploadState) {
        return null;
    }

    return (
        <div className={classes.root}>
            <div className={clsx(classes.box, classes[`state_${uploadState}`])}>
                <Icon
                    className={classes.icon}
                    path={UploadStateIcon[uploadState]}
                    spin={uploadState === "in_progress" ? 1 : 0}
                />
                <div className={classes.text}>
                    <div>{locale[`${type}_upload_${uploadState}`]}</div>
                    {progressMessage && <div>{progressMessage}</div>}
                </div>
            </div>
        </div>
    );
};

const UploadStateIcon = {
    in_progress: mdiLoading,
    not_available: mdiAlert,
    failed: mdiAlertOctagon,
};

const useStyles = createUseFlowStyles("UploadOverlay", ({palette, typography}) => ({
    root: {
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
    box: {
        textIndent: "initial",
        fontWeight: "normal",
        backgroundColor: Color(palette.tooltip).fade(0.25).toString(),
        color: palette.tooltipText,
        fontFamily: typography.ui,
        paddingBlock: 8,
        paddingInline: 16,
        border: `1px solid ${palette.tooltipText}`,
        borderRadius: 4,
        fontSize: "0.75rem",
        "&$state_not_available": {
            backgroundColor: Color(palette.warning).fade(0.25).toString(),
        },
        "&$state_failed": {
            backgroundColor: Color(palette.error).fade(0.25).toString(),
        },
        display: "flex",
        flexDirection: "row",
        alignItems: "top"
    },
    text: {
        minHeight: 24,
    },
    icon: {
        paddingTop: 2,
        paddingRight: 8,
        width: 24,
    },
    state_in_progress: {},
    state_not_available: {},
    state_failed: {},
}));
