import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFormatListNumbered } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";

export const OrderedListButton: FC<ToolbarProps> = ({controller, editingHost}) => (
    <ToolButton
        editingHost={editingHost}
        active={controller.isOrderedList()}
        onClick={controller.toggleOrderedList.bind(controller)}
        children={<Icon path={mdiFormatListNumbered}/>}
    />
);
