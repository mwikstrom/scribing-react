import React, { CSSProperties, FC, useMemo } from "react";
import Icon from "@mdi/react";
import { mdiAlertOctagonOutline, mdiAlertOutline, mdiCheckCircleOutline, mdiInformationOutline } from "@mdi/js";
import { PredefinedIcon } from "scribing";
import { useMaterialDesignIconPath } from "./IconPack";

export interface ResolvedIconProps {
    className?: string;
    data?: string;
}

export const ResolvedIcon: FC<ResolvedIconProps> = props => {
    const { data = "" } = props;
    if (MDI_PATTERN.test(data)) {
        return <MdiIcon {...props}/>;
    } else {
        return <PredefinedOrPathIcon {...props}/>;
    }
};

const MdiIcon: FC<ResolvedIconProps> = ({className, data = ""}) => {
    const iconName = data.replace(MDI_PATTERN, "");
    const path = useMaterialDesignIconPath(iconName);
    const iconStyle = useMemo<CSSProperties>(() => ({
        transition: "opacity ease-out 0.2s",
        opacity: path ? 1 : 0,
    }), [path]);
    console.log("render ", iconName, " has path ", !!path);
    return (<Icon path={path} className={className} style={iconStyle}/>);
};

const PredefinedOrPathIcon: FC<ResolvedIconProps> = ({className, data = ""}) => {
    const path = useMemo(() => {
        if (data in PREDEFINED_ICON_PATHS) {
            return PREDEFINED_ICON_PATHS[data as PredefinedIcon];
        } else if (ICON_NAME_PATTERN.test(data)) {
            console.warn("Unsupported icon: ", data);
            return "";
        } else {
            return data;
        }
    }, [data]);

    const iconStyle = useMemo<CSSProperties | undefined>(() => {
        if (!path) {
            return {
                backgroundImage: `repeating-linear-gradient(
                    -45deg,
                    currentcolor 0px,
                    currentcolor 3px,
                    transparent 3px,
                    transparent 6px
                )`,        
            };
        }
    }, [path]);

    return (<Icon path={path} className={className} style={iconStyle}/>);
};

const MDI_PATTERN = /^@mdi\//;
const ICON_NAME_PATTERN = /^(?:@[a-z-]+\/)?[a-z-]+$/i;

const PREDEFINED_ICON_PATHS: Readonly<Record<PredefinedIcon, string>> = Object.freeze({
    information: mdiInformationOutline,
    success: mdiCheckCircleOutline,
    warning: mdiAlertOutline,
    error: mdiAlertOctagonOutline,
});
