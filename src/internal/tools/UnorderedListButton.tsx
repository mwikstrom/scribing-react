import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFormatListBulleted } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";

export const UnorderedListButton: FC<ToolbarProps> = ({controller, editingHost}) => (
    <ToolButton
        editingHost={editingHost}
        active={controller.isUnorderedList()}
        onClick={controller.toggleUnorderedList.bind(controller)}
        children={<Icon path={mdiFormatListBulleted}/>}
    />
);
