import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFormatSubscript } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";

export const SubscriptButton: FC<ToolbarProps> = ({controller, editingHost}) => (
    <ToolButton
        editingHost={editingHost}
        active={controller.isSubscript()}
        onClick={controller.toggleSubscript.bind(controller)}
        children={<Icon path={mdiFormatSubscript}/>}
    />
);
