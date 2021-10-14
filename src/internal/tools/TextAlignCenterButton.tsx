import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFormatAlignCenter } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";

export const TextAlignCenterButton: FC<ToolbarProps> = ({commands}) => (
    <ToolButton
        active={commands.isTextAlignment("center")}
        onClick={commands.setTextAlignment.bind(commands, "center")}
        children={<Icon path={mdiFormatAlignCenter}/>}
    />
);
