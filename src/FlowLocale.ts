/** @public */
export interface FlowLocale {
    hold_ctrl_key_to_enable_interaction: string;
    script_error: string;
    void_script: string;
    void_result: string;
    image_upload_in_progress: string,
    image_upload_not_available: string,
    image_upload_failed: string,
}

/** @public */
export const DefaultFlowLocale: Readonly<FlowLocale> = Object.freeze({
    hold_ctrl_key_to_enable_interaction: "Hold CTRL key to enable interaction",
    script_error: "Script error",
    void_script: "Void script",
    void_result: "Void result",
    image_upload_in_progress: "Uploading image, please wait…",
    image_upload_not_available: "Image upload not available",
    image_upload_failed: "Image upload failed",
});
