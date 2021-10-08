/** @public */
export interface FlowLocale {
    hold_ctrl_key_to_enable_interaction: string;
}

/** @public */
export const DefaultFlowLocale: Readonly<FlowLocale> = Object.freeze({
    hold_ctrl_key_to_enable_interaction: "Hold CTRL key to enable interaction",
});
