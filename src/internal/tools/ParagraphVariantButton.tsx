import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "../ToolButton";
import { mdiFormatText, mdiMenuDown } from "@mdi/js";
import { ToolbarProps } from "../Toolbar";
import { getParagraphVariantLocaleKey, useFlowLocale } from "../..";

export const ParagraphVariantButton: FC<ToolbarProps> = ({commands}) => {
    const variant = commands.getParagraphVariant();
    const locale = useFlowLocale();
    const localeKey = variant ? getParagraphVariantLocaleKey(variant) : undefined;
    const label = localeKey ? locale[localeKey] : "";
    return (
        <ToolButton>
            <Icon path={mdiFormatText} size={0.75}/>
            {label}
            <Icon path={mdiMenuDown} size={0.75}/>
        </ToolButton>
    );
};
