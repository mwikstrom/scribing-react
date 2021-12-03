import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFormatAlignLeft } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";

export const TextAlignLeftButton: FC<ToolbarProps> = ({controller, editingHost}) => {
    const alignment = controller.isTextDirection("rtl") ? "end" : "start";
    return (
        <ToolButton
            editingHost={editingHost}
            active={controller.isTextAlignment(alignment)}
            onClick={controller.setTextAlignment.bind(controller, alignment)}
            children={<Icon path={mdiFormatAlignLeft}/>}
        />
    );
};
