import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFormatItalic } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";

export const ItalicButton: FC<ToolbarProps> = ({commands}) => (
    <ToolButton
        active={commands.isItalic()}
        onClick={commands.toggleItalic.bind(commands)}
        children={<Icon path={mdiFormatItalic}/>}
    />
);
