import React, { FC } from "react";
import { mdiTextBoxOutline } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";
import { BOX_VARIANTS } from "scribing";
import { useFlowLocale } from "../FlowLocaleScope";
import { getBoxVariantLocaleKey } from "../FlowLocale";
import { Selector } from "./Selector";

export const BoxVariantButton: FC<ToolbarProps> = ({commands, boundary, editingHost}) => {
    const locale = useFlowLocale();
    return (
        <Selector
            editingHost={editingHost}
            boundary={boundary}
            options={BOX_VARIANTS}
            current={commands.getBoxStyle().variant}
            icon={mdiTextBoxOutline}
            onChange={option => commands.formatBox("variant", option)}
            getLabel={option => locale[getBoxVariantLocaleKey(option)]}
        />
    );
};
