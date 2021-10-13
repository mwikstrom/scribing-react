/** @public */
export interface FlowLocale {
    hold_ctrl_key_to_enable_interaction: string;
    script_error: string;
}

/** @public */
export const DefaultFlowLocale: Readonly<FlowLocale> = Object.freeze({
    hold_ctrl_key_to_enable_interaction: "Hold CTRL key to enable interaction",
    script_error: "Script error",
});
