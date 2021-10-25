import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFormatAlignJustify } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";

export const TextAlignJustifyButton: FC<ToolbarProps> = ({commands, editingHost}) => (
    <ToolButton
        editingHost={editingHost}
        active={commands.isTextAlignment("justify")}
        onClick={commands.setTextAlignment.bind(commands, "justify")}
        children={<Icon path={mdiFormatAlignJustify}/>}
    />
);
