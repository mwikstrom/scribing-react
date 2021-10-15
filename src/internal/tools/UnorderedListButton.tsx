import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFormatListBulleted } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";

export const UnorderedListButton: FC<ToolbarProps> = ({commands}) => (
    <ToolButton
        active={commands.isUnorderedList()}
        onClick={commands.toggleUnorderedList.bind(commands)}
        children={<Icon path={mdiFormatListBulleted}/>}
    />
);
