import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFormatItalic } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";

export const ItalicButton: FC<ToolbarProps> = ({controller, editingHost}) => (
    <ToolButton
        editingHost={editingHost}
        active={controller.isItalic()}
        onClick={controller.toggleItalic.bind(controller)}
        children={<Icon path={mdiFormatItalic}/>}
    />
);
