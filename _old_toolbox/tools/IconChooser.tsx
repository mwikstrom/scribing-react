import clsx from "clsx";
import Color from "color";
import React, { FC, useMemo, useState } from "react";
import { PREDEFINED_ICONS } from "scribing";
import { IconPack, useMaterialDesignIconsMetadata } from "../IconPack";
import { createUseFlowStyles } from "../JssTheming";
import { ResolvedIcon } from "../ResolvedIcon";
import { IconPackSelector } from "./IconPackSelector";
import { MdiTagSelector } from "./MdiTagSelector";
import { ToolDivider } from "./ToolDivider";
import { VirtualGrid } from "./VirtualGrid";

export interface IconChooserProps {
    editingHost: HTMLElement | null;
    boundary?: HTMLElement | null;
    current?: string | null;
    onIconSelected?: (icon: string) => void;
}

export const IconChooser: FC<IconChooserProps> = props => {
    const { editingHost, boundary, current, onIconSelected = () => void(0) } = props;
    const [iconPack, setIconPack] = useState<IconPack>("predefined");
    const [mdiTag, setMdiTag] = useState("");
    const classes = useStyles();
    const mdiMeta = useMaterialDesignIconsMetadata();
    const [hoverIcon, setHoverIcon] = useState<string | null>(null);
    const iconsInGallery = useMemo<readonly string[]>(() => {
        if (iconPack === "predefined") {
            return PREDEFINED_ICONS;
        } else if (!mdiMeta) {
            return [];
        } else {
            return mdiMeta.filter(entry => !mdiTag || entry.tags.includes(mdiTag)).map(entry => `@mdi/${entry.name}`);
        }
    }, [iconPack, mdiTag, mdiMeta]);
    return (
        <div className={classes.root}>
            <div className={classes.header}>
                <IconPackSelector
                    editingHost={editingHost}
                    boundary={boundary}
                    current={iconPack}
                    onChange={setIconPack}
                />
                {iconPack === "mdi" && (
                    <>
                        <ToolDivider/>
                        <MdiTagSelector
                            editingHost={editingHost}
                            boundary={boundary}
                            current={mdiTag}
                            onChange={setMdiTag}
                        />
                    </>
                )}
            </div>
            <VirtualGrid 
                className={classes.gallery}
                children={iconsInGallery}
                itemWidth={ITEM_SIZE}
                itemHeight={ITEM_SIZE}
                getItemKey={item => item}
                renderItem={item => (
                    <span
                        className={clsx(
                            classes.iconButton,
                            hoverIcon === item && classes.iconButtonHover,
                            current === item && classes.iconButtonCurrent,
                        )}
                        onMouseOver={() => setHoverIcon(item)}
                        onMouseOut={() => setHoverIcon(before => before === item ? null : before)}
                        onClick={() => onIconSelected(item)}
                        children={<ResolvedIcon className={classes.icon} data={item}/>}
                    />
                )}
                itemClass={classes.galleryItem}
                itemDisplay={"inline-flex"}
                maxRows={5}
                resetScrollOnChange
            />
        </div>
    );
};

const useStyles = createUseFlowStyles("IconChooser", ({palette}) => ({
    root: {
        display: "flex",
        flexDirection: "column",
        padding: 4,
        width: "calc(min(80vw, 816px))",
    },
    header: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: 4,
    },
    gallery: {
        border: `1px solid ${palette.menuBorder}`,
        borderRadius: 4,
        backgroundColor: palette.paper,
        color: palette.text,
        "&::-webkit-scrollbar": {
            width: 8,
            height: 8,
        },
        "&::-webkit-scrollbar-track": {
            background: palette.menuBorder,
            padding: 1,
        },
        "&::-webkit-scrollbar-corner": {
            background: palette.menuBorder,
        },
        "&::-webkit-scrollbar-thumb": {
            backgroundColor: palette.menuScrollbar,
            borderRadius: 2,
        },
    },
    galleryItem: {
        width: ITEM_SIZE,
        height: ITEM_SIZE,
        alignItems: "center",
        justifyContent: "center",
    },
    iconButton: {
        cursor: "pointer",
        color: Color(palette.text).fade(0.2).toString(),
        borderRadius: 4,
        borderWidth: 2,
        borderStyle: "solid",
        borderColor: "transparent",
        display: "inline-flex",
        width: ITEM_SIZE - 4,
        height: ITEM_SIZE - 4,
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
    },
    iconButtonHover: {
        color: palette.text,
        backgroundColor: Color(palette.text).fade(0.8).toString(),
    },
    iconButtonCurrent: {
        borderColor: palette.selection,
    },
    icon: {
        width: ICON_SIZE,
        height: ICON_SIZE,
    },
}));

const ICON_SIZE = 48;
const ITEM_SIZE = 80;
