import React, { FC, useState } from "react";
import { IconPack } from "../IconPack";
import { createUseFlowStyles } from "../JssTheming";
import { IconPackSelector } from "./IconPackSelector";
import { MdiTagSelector } from "./MdiTagSelector";
import { ToolDivider } from "./ToolDivider";

export interface IconChooserProps {
    editingHost: HTMLElement | null;
    boundary?: HTMLElement | null;
}

export const IconChooser: FC<IconChooserProps> = props => {
    const { editingHost, boundary } = props;
    const [iconPack, setIconPack] = useState<IconPack>("predefined");
    const [mdiTag, setMdiTag] = useState("");
    const classes = useStyles();
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
            <div className={classes.gallery}>            
            </div>
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
        overflowY: "auto",
    }
}));
