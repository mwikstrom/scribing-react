import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFormatBold } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";

export const BoldButton: FC<ToolbarProps> = ({commands, editingHost}) => (
    <ToolButton
        editingHost={editingHost}
        active={commands.isBold()}
        onClick={commands.toggleBold.bind(commands)}
        children={<Icon path={mdiFormatBold}/>}
    />
);
