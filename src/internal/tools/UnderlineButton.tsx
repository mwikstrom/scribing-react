import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFormatUnderline } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";

export const UnderlineButton: FC<ToolbarProps> = ({commands}) => (
    <ToolButton
        active={commands.isUnderlined()}
        onClick={commands.toggleUnderline.bind(commands)}
        children={<Icon path={mdiFormatUnderline}/>}
    />
);
