import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFormatAlignRight } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";

export const TextAlignRightButton: FC<ToolbarProps> = ({commands}) => {
    const alignment = commands.isTextDirection("rtl") ? "start" : "end";
    return (
        <ToolButton
            active={commands.isTextAlignment(alignment)}
            onClick={commands.setTextAlignment.bind(commands, alignment)}
            children={<Icon path={mdiFormatAlignRight}/>}
        />
    );
};
