import React, { FC, useMemo, useState } from "react";
import { PREDEFINED_ICONS } from "scribing";
import { IconPack, useMaterialDesignIconsMetadata } from "../IconPack";
import { createUseFlowStyles } from "../JssTheming";
import { IconPackSelector } from "./IconPackSelector";
import { MdiTagSelector } from "./MdiTagSelector";
import { ToolDivider } from "./ToolDivider";
import { VirtualGrid } from "./VirtualGrid";

export interface IconChooserProps {
    editingHost: HTMLElement | null;
    boundary?: HTMLElement | null;
}

export const IconChooser: FC<IconChooserProps> = props => {
    const { editingHost, boundary } = props;
    const [iconPack, setIconPack] = useState<IconPack>("predefined");
    const [mdiTag, setMdiTag] = useState("");
    const classes = useStyles();
    const mdiMeta = useMaterialDesignIconsMetadata();
    const iconsInGallery = useMemo<readonly string[]>(() => {
        if (iconPack === "predefined") {
            return PREDEFINED_ICONS;
        } else if (!mdiMeta) {
            return [];
        } else {
            return mdiMeta.filter(entry => !mdiTag || entry.tags.includes(mdiTag)).map(entry => `@mdi/${entry.name}`);
        }
    }, [iconPack, mdiTag, mdiMeta]);
    const iconSize = 64;
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
                itemWidth={iconSize}
                itemHeight={iconSize}
                getItemKey={item => item}
                renderItem={item => <span style={{color:"black"}}>{item}</span>}
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
        width: "calc(min(80vw, 800px))",
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
        height: 360,
    }
}));
