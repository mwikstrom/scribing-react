import React, { FC, useState } from "react";
import { createUseStyles } from "react-jss";
import { IconPack } from "../IconPack";
import { makeJssId } from "../utils/make-jss-id";
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
        </div>
    );
};

const useStyles = createUseStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        padding: 4,

    },
    header: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    }
}, {
    generateId: makeJssId("IconChooser"),
});
