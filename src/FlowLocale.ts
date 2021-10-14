import { ParagraphStyleVariant } from "scribing";

/** @public */
export interface FlowLocale extends Record<ParagraphVariantLocaleKey, string> {
    hold_ctrl_key_to_enable_interaction: string;
    script_error: string;
}

/** @public */
export type ParagraphVariantLocaleKey = `paragraph_variant_${ParagraphStyleVariant}`;

/** @public */
export const DefaultFlowLocale: Readonly<FlowLocale> = Object.freeze({
    hold_ctrl_key_to_enable_interaction: "Hold CTRL key to enable interaction",
    script_error: "Script error",
    paragraph_variant_normal: "Normal",
    paragraph_variant_h1: "Heading 1",
    paragraph_variant_h2: "Heading 2",
    paragraph_variant_h3: "Heading 3",
    paragraph_variant_h4: "Heading 4",
    paragraph_variant_h5: "Heading 5",
    paragraph_variant_h6: "Heading 6",
    paragraph_variant_title: "Title",
    paragraph_variant_subtitle: "Subtitle",
    paragraph_variant_preamble: "Preamble",
    paragraph_variant_code: "Code",
});

/** @public */
export function getParagraphVariantLocaleKey(variant: ParagraphStyleVariant): ParagraphVariantLocaleKey {
    return `paragraph_variant_${variant}`;
}