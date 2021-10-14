import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "../ToolButton";
import { mdiFormatText, mdiMenuDown } from "@mdi/js";
import { ToolbarProps } from "../Toolbar";
import { PARAGRAPH_STYLE_VARIANTS } from "scribing";
import { ParagraphVariantLabel } from "./ParagraphVariantLabel";

export const ParagraphVariantButton: FC<ToolbarProps> = ({commands}) => {
    const variant = commands.getParagraphVariant();
    return (
        <ToolButton>
            <Icon path={mdiFormatText} size={0.75}/>
            <span>
                {PARAGRAPH_STYLE_VARIANTS.map(option => (
                    <ParagraphVariantLabel
                        key={option}
                        variant={option}
                        collapsed={option !== variant}
                    />
                ))}
            </span>
            <Icon path={mdiMenuDown} size={0.75}/>
        </ToolButton>
    );
};
