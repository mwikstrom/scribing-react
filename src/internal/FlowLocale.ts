import { ParagraphVariant, FlowColor, BoxVariant } from "scribing";
import { IconPack } from "./IconPack";

/** @public */
export interface FlowLocale extends 
Record<ParagraphVariantLocaleKey, string>, 
Record<BoxVariantLocaleKey, string>, 
Record<ColorLocaleKey, string>,
Record<IconPackLocaleKey, string> {
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
    insert_box: string;
    insert_dynamic_text: string;
    ltr_reading_direction: string;
    rtl_reading_direction: string;
    full_width_box: string;
    enable_spell_check: string;
    insert_icon: string;
    change_icon: string;
}

/** @public */
export type ParagraphVariantLocaleKey = `paragraph_variant_${ParagraphVariant}`;

/** @public */
export type BoxVariantLocaleKey = `box_variant_${BoxVariant}`;

/** @public */
export type ColorLocaleKey = `color_${FlowColor}`;

/** @public */
export type IconPackLocaleKey = `icon_pack_${IconPack}`;

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
    insert_box: "Insert box",
    insert_dynamic_text: "Insert dynamic text",
    ltr_reading_direction: "Left-to-right reading direction",
    rtl_reading_direction: "Right-to-left reading direction",
    full_width_box: "Full width box",
    box_variant_basic: "Basic",
    box_variant_contained: "Contained",
    box_variant_outlined: "Outlined",
    box_variant_alert: "Alert",
    box_variant_quote: "Quote",
    enable_spell_check: "Enable spell check",
    insert_icon: "Insert icon",
    change_icon: "Change icon",
    icon_pack_predefined: "Predefined",
    icon_pack_custom: "Custom",
    icon_pack_mdi: "Material Design Icons",
});

/** @public */
export function getParagraphVariantLocaleKey(variant: ParagraphVariant): ParagraphVariantLocaleKey {
    return `paragraph_variant_${variant}`;
}

/** @public */
export function getBoxVariantLocaleKey(variant: BoxVariant): BoxVariantLocaleKey {
    return `box_variant_${variant}`;
}

/** @public */
export function getFlowColorLocaleKey(color: FlowColor): ColorLocaleKey {
    return `color_${color}`;
}

/** @public */
export function getIconPackLocaleKey(pack: IconPack): IconPackLocaleKey {
    return `icon_pack_${pack}`;
}
