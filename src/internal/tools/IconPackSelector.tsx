import React, { FC } from "react";
import { mdiArchive, mdiArchiveEdit } from "@mdi/js";
import { useFlowLocale } from "../FlowLocaleScope";
import { getIconPackLocaleKey } from "../FlowLocale";
import { IconPack, ICON_PACKS } from "../IconPack";
import { Selector } from "./Selector";

export interface IconPackSelectorProps {
    editingHost: HTMLElement | null;
    boundary?: HTMLElement | null;
    current: IconPack;
    onChange: (option: IconPack) => void;
}

export const IconPackSelector: FC<IconPackSelectorProps> = props => {
    const { current } = props;
    const locale = useFlowLocale();
    return (
        <Selector
            {...props}
            options={ICON_PACKS}
            icon={current === "custom" ? mdiArchiveEdit : mdiArchive}
            getLabel={option => locale[getIconPackLocaleKey(option)]}
        />
    );
};
