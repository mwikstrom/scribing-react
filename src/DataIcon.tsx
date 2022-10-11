import React, { CSSProperties, FC, useMemo } from "react";
import Icon from "@mdi/react";
import { mdiAlertOctagonOutline, mdiAlertOutline, mdiCheckCircleOutline, mdiInformationOutline } from "@mdi/js";
import { PredefinedIcon, PREDEFINED_ICONS } from "scribing";
import { 
    ICON_PACKS, 
    useMaterialDesignIconPath, 
    useMaterialDesignIcons, 
    useMaterialDesignIconTags 
} from "./internal/IconPack";

/** @public */
export interface DataIconProps {
    className?: string;
    data?: string;
}

/** @public */
export const DataIcon: FC<DataIconProps> = props => {
    const { data = "" } = props;
    if (MDI_PATTERN.test(data)) {
        return <MdiIcon {...props}/>;
    } else {
        return <PredefinedOrPathIcon {...props}/>;
    }
};

/** @public */
export function useDataIconPacks(): readonly string[] {
    return ICON_PACKS;
}

/** @public */
export function useDataIconTags(pack: string): readonly string[] | null {
    const mdiTags = useMaterialDesignIconTags();
    if (pack === "mdi") {
        return mdiTags;
    } else {
        return null;
    }
}

/** @public */
export function useDataIcons(pack?: string, tag?: string): readonly string[] {
    const mdiIcons = useMaterialDesignIcons(tag);
    return useMemo(() => {
        const result: string[] = [];
        if (!pack || pack === "predefined") {
            result.push(...PREDEFINED_ICONS);
        }
        if ((!pack || pack === "mdi") && mdiIcons) {
            result.push(...mdiIcons);
        }
        return result;
    }, [pack, mdiIcons]);
}

const MdiIcon: FC<DataIconProps> = ({className, data = ""}) => {
    const iconName = data.replace(MDI_PATTERN, "");
    const path = useMaterialDesignIconPath(iconName);
    const iconStyle = useMemo<CSSProperties>(() => ({
        transition: "opacity ease-out 0.2s",
        opacity: path ? 1 : 0,
        userSelect: "none",
    }), [path]);
    return (<>&#x200B;<Icon path={path} className={className} style={iconStyle}/></>);
};

const PredefinedOrPathIcon: FC<DataIconProps> = ({className, data = ""}) => {
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

    return (<>&#x200B;<Icon path={path} className={className} style={iconStyle}/></>);
};

const MDI_PATTERN = /^@mdi\//;
const ICON_NAME_PATTERN = /^(?:@[a-z-]+\/)?[a-z-]+$/i;

const PREDEFINED_ICON_PATHS: Readonly<Record<PredefinedIcon, string>> = Object.freeze({
    information: mdiInformationOutline,
    success: mdiCheckCircleOutline,
    warning: mdiAlertOutline,
    error: mdiAlertOctagonOutline,
});
