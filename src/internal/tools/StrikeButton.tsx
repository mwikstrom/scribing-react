import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFormatStrikethrough } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";

export const StrikeButton: FC<ToolbarProps> = ({commands, editingHost}) => (
    <ToolButton
        editingHost={editingHost}
        active={commands.isStricken()}
        onClick={commands.toggleStrike.bind(commands)}
        children={<Icon path={mdiFormatStrikethrough}/>}
    />
);
