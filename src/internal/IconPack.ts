export type IconPack = (typeof ICON_PACKS)[number];

export const ICON_PACKS = Object.freeze([
    "predefined",
    "mdi",
    "custom",
] as const);
 