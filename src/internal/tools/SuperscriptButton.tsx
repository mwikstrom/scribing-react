import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFormatSuperscript } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";

export const SuperscriptButton: FC<ToolbarProps> = ({controller, editingHost}) => (
    <ToolButton
        editingHost={editingHost}
        active={controller.isSuperscript()}
        onClick={controller.toggleSuperscript.bind(controller)}
        children={<Icon path={mdiFormatSuperscript}/>}
    />
);
