import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFormatListNumbered } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";

export const OrderedListButton: FC<ToolbarProps> = ({commands}) => (
    <ToolButton
        active={commands.isOrderedList()}
        onClick={commands.toggleOrderedList.bind(commands)}
        children={<Icon path={mdiFormatListNumbered}/>}
    />
);
