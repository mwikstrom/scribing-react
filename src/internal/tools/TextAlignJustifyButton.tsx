import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFormatAlignJustify } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";

export const TextAlignJustifyButton: FC<ToolbarProps> = ({controller, editingHost}) => (
    <ToolButton
        editingHost={editingHost}
        active={controller.isTextAlignment("justify")}
        onClick={controller.setTextAlignment.bind(controller, "justify")}
        children={<Icon path={mdiFormatAlignJustify}/>}
    />
);
