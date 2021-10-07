/** @public */
export interface FlowPalette {
    paper: string;
    text: string;
    primary: string;
    secondary: string;
    warning: string;
    error: string;
    information: string;
    success: string;
    subtle: string;
    activeSelection: string;
    activeSelectionText: string;
    inactiveSelection: string;
    inactiveSelectionText: string;
}

/** @public */
export const DefaultFlowPalette: Readonly<FlowPalette> = Object.freeze({
    paper: "#ffffff",
    text: "#212121",
    primary: "#304ffe",
    secondary: "#8e24aa",
    warning: "#ef6c00",
    error: "#c62828",
    information: "#0277bd",
    success: "#2e7d32",
    subtle: "#9e9e9e",
    activeSelection: "#3390ff",
    activeSelectionText: "#ffffff",
    inactiveSelection: "#c8c8c8",
    inactiveSelectionText: "#000000",
});
