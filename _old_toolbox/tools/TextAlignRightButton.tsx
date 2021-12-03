import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFormatAlignRight } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";

export const TextAlignRightButton: FC<ToolbarProps> = ({controller, editingHost}) => {
    const alignment = controller.isTextDirection("rtl") ? "start" : "end";
    return (
        <ToolButton
            editingHost={editingHost}
            active={controller.isTextAlignment(alignment)}
            onClick={controller.setTextAlignment.bind(controller, alignment)}
            children={<Icon path={mdiFormatAlignRight}/>}
        />
    );
};
