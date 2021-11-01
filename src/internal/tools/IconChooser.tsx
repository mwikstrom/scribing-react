import React, { FC, useState } from "react";
import { createUseStyles } from "react-jss";
import { IconPack } from "../IconPack";
import { makeJssId } from "../utils/make-jss-id";
import { IconPackSelector } from "./IconPackSelector";

export interface IconChooserProps {
    editingHost: HTMLElement | null;
    boundary?: HTMLElement | null;
}

export const IconChooser: FC<IconChooserProps> = props => {
    const { editingHost, boundary } = props;
    const [iconPack, setIconPack] = useState<IconPack>("predefined");
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <IconPackSelector
                editingHost={editingHost}
                boundary={boundary}
                current={iconPack}
                onChange={setIconPack}
            />
        </div>
    );
};

const useStyles = createUseStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        padding: 4,

    },
}, {
    generateId: makeJssId("IconChooser"),
});
