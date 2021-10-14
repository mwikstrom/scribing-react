import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFormatSuperscript } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";

export const SuperscriptButton: FC<ToolbarProps> = ({commands}) => (
    <ToolButton
        active={commands.isSuperscript()}
        onClick={commands.toggleSuperscript.bind(commands)}
        children={<Icon path={mdiFormatSuperscript}/>}
    />
);
