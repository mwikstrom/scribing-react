import { SYSTEM_FONT } from "./internal/utils/system-font";

/** @public */
export interface FlowTypography {
    body: string;
    heading: string;
    monospace: string;
    cursive: string;
    decorative: string;
    ui: string;
}

/** @public */
export const DefaultFlowTypography: Readonly<FlowTypography> = Object.freeze({
    body: "serif",
    heading: "sans-serif",
    monospace: "monospace",
    cursive: "cursive",
    decorative: "fantasy",
    ui: SYSTEM_FONT,
});
