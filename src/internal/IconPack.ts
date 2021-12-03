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

export function useMaterialDesignIconPath(iconName: string): string {
    const [path, setPath] = useState(() => MDI_ICON_PATH_CACHE.get(iconName) ?? "");
    useEffect(() => {
        let promise = MDI_ICON_PATH_PROMISES.get(iconName);
        if (!promise) {
            MDI_ICON_PATH_PROMISES.set(iconName, promise = fetchMdiIconPath(iconName));
        }
        let active = true;
        promise.then(data => {
            MDI_ICON_PATH_CACHE.set(iconName, data);
            if (active) {
                setPath(data);
            }
        });
        return () => { active = false; };
    }, [iconName]);
    return path;
}

export function useMaterialDesignIconTags(): readonly string[] | null {
    const [result, setResult] = useState(MDI_TAGS_CACHE);
    const meta = useMaterialDesignIconsMetadata();
    
    useEffect(() => {
        if (!result && meta) {
            setResult(MDI_TAGS_CACHE = Object.freeze(Array.from(new Set(meta.flatMap(entry => entry.tags))).sort()));
        }
    }, [result, meta]);

    return result;
}

export function useMaterialDesignIcons(tag = ""): readonly string[] | null {
    const [result, setResult] = useState(() => MDI_ICONS_CACHE.get(tag) ?? null);
    const meta = useMaterialDesignIconsMetadata();
    
    useEffect(() => setResult(MDI_ICONS_CACHE.get(tag) ?? null), [tag]);
    useEffect(() => {
        if (!result && meta) {
            const filtered = tag ? meta.filter(entry => entry.tags.includes(tag)) : meta;
            const mapped = Object.freeze(filtered.map(entry => `@mdi/${entry.name}`));
            MDI_ICONS_CACHE.set(tag, mapped);
            setResult(mapped);
        }
    }, [tag, result, meta]);

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

const fetchMdiIconPath = async (iconName: string) => {
    try {
        const response = await fetch(MDI_SVG_URL(iconName));
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
        const doc = new DOMParser().parseFromString(await response.text(), "image/svg+xml");
        return doc.querySelector("path")?.getAttribute("d") ?? "";        
    } catch (error) {
        console.error(`Failed to Material Design Icon '${iconName}:`, error);
        return "";
    }
};

const MDI_VERSION = "6.4.95";
const MDI_META_URL = `https://cdn.jsdelivr.net/npm/@mdi/svg@${MDI_VERSION}/meta.json`;
const MDI_SVG_URL = (iconName: string) => `https://cdn.jsdelivr.net/npm/@mdi/svg@${MDI_VERSION}/svg/${iconName}.svg`;
let MDI_META_CACHE: MdiMetadata | null = null;
let MDI_META_PROMISE: Promise<MdiMetadata | null> | null = null;
let MDI_TAGS_CACHE: readonly string[] | null = null;
const MDI_ICONS_CACHE = new Map<string, readonly string[]>();
const MDI_ICON_PATH_CACHE = new Map<string, string>();
const MDI_ICON_PATH_PROMISES = new Map<string, Promise<string>>();
