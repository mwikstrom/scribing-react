import React, { FC } from "react";
import { mdiFormatText } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";
import { PARAGRAPH_VARIANTS } from "scribing";
import { useFlowLocale } from "../FlowLocaleScope";
import { getParagraphVariantLocaleKey } from "../FlowLocale";
import { Selector } from "./Selector";

export const ParagraphVariantButton: FC<ToolbarProps> = ({controller, boundary, editingHost}) => {
    const locale = useFlowLocale();
    return (
        <Selector
            editingHost={editingHost}
            boundary={boundary}
            options={PARAGRAPH_VARIANTS}
            current={controller.getParagraphVariant()}
            icon={mdiFormatText}
            onChange={option => controller.setParagraphVariant(option)}
            getLabel={option => locale[getParagraphVariantLocaleKey(option)]}
        />
    );
};
