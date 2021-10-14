import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFormatText, mdiMenuDown } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";
import { PARAGRAPH_STYLE_VARIANTS } from "scribing";
import { useFlowLocale } from "../../FlowLocaleScope";
import { getParagraphVariantLocaleKey } from "../..";

export const ParagraphVariantButton: FC<ToolbarProps> = ({commands}) => {
    const locale = useFlowLocale();
    const variant = commands.getParagraphVariant();
    return (
        <ToolButton>
            <Icon path={mdiFormatText} size={0.75}/>
            <span style={{ margin: "0 0.5rem" }}>
                {PARAGRAPH_STYLE_VARIANTS.map(option => (
                    <div 
                        key={option}
                        style={option === variant ? undefined : {
                            overflow: "hidden",
                            height: 0,
                        }}
                        children={locale[getParagraphVariantLocaleKey(option)]}
                    />
                ))}
            </span>
            <Icon path={mdiMenuDown} size={0.75}/>
        </ToolButton>
    );
};
