import { ParagraphVariant, FlowColor } from "scribing";

/** @public */
export interface FlowLocale extends 
Record<ParagraphVariantLocaleKey, string>, 
Record<ColorLocaleKey, string> {
    hold_ctrl_key_to_enable_interaction: string;
    script_error: string;
    void_script: string;
    void_result: string;
    not_interactive: string;
    open_web_page: string;
    run_script: string;
    enter_web_page_url: string;
    must_be_a_valid_web_page_url: string;
    enter_script: string;
    show_formatting_marks: string;
    insert_dynamic_text: string;
}

/** @public */
export type ParagraphVariantLocaleKey = `paragraph_variant_${ParagraphVariant}`;

/** @public */
export type ColorLocaleKey = `color_${FlowColor}`;

/** @public */
export const DefaultFlowLocale: Readonly<FlowLocale> = Object.freeze({
    hold_ctrl_key_to_enable_interaction: "Hold CTRL key to enable interaction",
    script_error: "Script error",
    void_script: "Void script",
    void_result: "Void result",
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
    color_default: "Default",
    color_subtle: "Subtle",
    color_primary: "Primary accent",
    color_secondary: "Secondary accent",
    color_information: "Information",
    color_success: "Success",
    color_warning: "Warning",
    color_error: "Error",
    not_interactive: "Not interactive",
    open_web_page: "Open web page",
    run_script: "Run script",
    enter_web_page_url: "Enter web page URL",
    must_be_a_valid_web_page_url: "Must be a fully qualified https URL",
    enter_script: "Enter script expression or statement block",
    show_formatting_marks: "Show formatting marks",
    insert_dynamic_text: "Insert dynamic text",
});

/** @public */
export function getParagraphVariantLocaleKey(variant: ParagraphVariant): ParagraphVariantLocaleKey {
    return `paragraph_variant_${variant}`;
}

/** @public */
export function getFlowColorLocaleKey(variant: FlowColor): ColorLocaleKey {
    return `color_${variant}`;
}