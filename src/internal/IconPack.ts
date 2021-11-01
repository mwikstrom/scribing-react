import { useEffect, useState } from "react";

export type IconPack = (typeof ICON_PACKS)[number];

export const ICON_PACKS = Object.freeze([
    "predefined",
    "mdi",
    "custom",
] as const);

export function useMaterialDesignIconsMetadata(): MdiMetadata | null {
    const [result, setResult] = useState(MDI_META_CACHE);

    useEffect(() => {
        if (!result) {
            if (!MDI_META_PROMISE) {
                MDI_META_PROMISE = fetchMdiMetadata();
            }
            let active = true;
            MDI_META_PROMISE.then(data => {
                MDI_META_CACHE = data;
                if (active) {
                    setResult(data ?? []);
                }
            });
            return () => { active = false; };
        }
    }, [result]);

    return result;
}

export type MdiMetadata = readonly MdiMetaEntry[];

export interface MdiMetaEntry {
    readonly id: string;
    readonly name: string;
    readonly codepoint: string;
    readonly aliases: readonly string[];
    readonly tags: readonly string[];
    readonly author: string;
    readonly version: string;
}

let MDI_META_CACHE: MdiMetadata | null = null;
let MDI_META_PROMISE: Promise<MdiMetadata | null> | null = null;

const fetchMdiMetadata = async () => {
    try {
        const response = await fetch(MDI_META_URL);
        if (response.ok) {
            return await response.json() as MdiMetadata;
        } else {
            throw new Error(`Server responded with status: ${response.status}`);
        }    
    } catch (error) {
        console.error("Failed to fetch Material Design Icons metadata:", error);
        return null;
    }
};

const MDI_VERSION = "6.4.95";
const MDI_META_URL = `https://cdn.jsdelivr.net/npm/@mdi/svg@${MDI_VERSION}/meta.json`;