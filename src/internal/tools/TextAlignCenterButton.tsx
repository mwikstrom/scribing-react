import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFormatAlignCenter } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";

export const TextAlignCenterButton: FC<ToolbarProps> = ({controller, editingHost}) => (
    <ToolButton
        editingHost={editingHost}
        active={controller.isTextAlignment("center")}
        onClick={controller.setTextAlignment.bind(controller, "center")}
        children={<Icon path={mdiFormatAlignCenter}/>}
    />
);
