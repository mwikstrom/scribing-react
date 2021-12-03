import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFormatStrikethrough } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";

export const StrikeButton: FC<ToolbarProps> = ({controller, editingHost}) => (
    <ToolButton
        editingHost={editingHost}
        active={controller.isStricken()}
        onClick={controller.toggleStrike.bind(controller)}
        children={<Icon path={mdiFormatStrikethrough}/>}
    />
);
