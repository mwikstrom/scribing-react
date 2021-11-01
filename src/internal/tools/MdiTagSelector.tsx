import React, { FC, useEffect, useState } from "react";
import { mdiTag } from "@mdi/js";
import { useMaterialDesignIconsMetadata } from "../IconPack";
import { Selector } from "./Selector";

export interface MdiTagSelectorProps {
    editingHost: HTMLElement | null;
    boundary?: HTMLElement | null;
    current: string;
    onChange: (option: string) => void;
}

export const MdiTagSelector: FC<MdiTagSelectorProps> = props => {
    const options = useMaterialDesignIconTags();
    return !options ? null : (
        <Selector
            {...props}
            options={options}
            icon={mdiTag}
        />
    );
};

export function useMaterialDesignIconTags(): readonly string[] | null {
    const [result, setResult] = useState(MDI_TAGS_CACHE);
    const meta = useMaterialDesignIconsMetadata();
    
    useEffect(() => {
        if (!result && meta) {
            setResult(MDI_TAGS_CACHE = Array.from(new Set(meta.flatMap(entry => entry.tags))).sort());
        }
    }, [result, meta]);

    return result;
}

let MDI_TAGS_CACHE: readonly string[] | null = null;
