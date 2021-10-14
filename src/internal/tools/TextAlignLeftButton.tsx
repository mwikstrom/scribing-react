import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFormatAlignLeft } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";

export const TextAlignLeftButton: FC<ToolbarProps> = ({commands}) => {
    const alignment = commands.isTextDirection("rtl") ? "end" : "start";
    return (
        <ToolButton
            active={commands.isTextAlignment(alignment)}
            onClick={commands.setTextAlignment.bind(commands, alignment)}
            children={<Icon path={mdiFormatAlignLeft}/>}
        />
    );
};
