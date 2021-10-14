import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "../ToolButton";
import { mdiFormatText, mdiMenuDown } from "@mdi/js";
import { ToolbarProps } from "../Toolbar";

export const ParagraphVariantButton: FC<ToolbarProps> = ({commands}) => {
    const variant = commands.getParagraphVariant();
    return (
        <ToolButton>
            <Icon path={mdiFormatText} size={0.75}/>
            {variant}
            <Icon path={mdiMenuDown} size={0.75}/>
        </ToolButton>
    );
};
