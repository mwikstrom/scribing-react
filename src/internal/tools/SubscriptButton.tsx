import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFormatSubscript } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";

export const SubscriptButton: FC<ToolbarProps> = ({commands, editingHost}) => (
    <ToolButton
        editingHost={editingHost}
        active={commands.isSubscript()}
        onClick={commands.toggleSubscript.bind(commands)}
        children={<Icon path={mdiFormatSubscript}/>}
    />
);
