import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFormatUnderline } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";

export const UnderlineButton: FC<ToolbarProps> = ({controller, editingHost}) => (
    <ToolButton
        editingHost={editingHost}
        active={controller.isUnderlined()}
        onClick={controller.toggleUnderline.bind(controller)}
        children={<Icon path={mdiFormatUnderline}/>}
    />
);
