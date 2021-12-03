import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFormatBold } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";

export const BoldButton: FC<ToolbarProps> = ({controller, editingHost}) => (
    <ToolButton
        editingHost={editingHost}
        active={controller.isBold()}
        onClick={controller.toggleBold.bind(controller)}
        children={<Icon path={mdiFormatBold}/>}
    />
);
