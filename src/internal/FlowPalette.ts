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
    tooltip: string;
    tooltipText: string;
    activeTool: string;
    activeToolText: string;
    inactiveTool: string;
    inactiveToolText: string;
    hoverTool: string;
    toolDivider: string;
    menu: string;
    menuText: string;
    menuBorder: string;
    hoverMenu: string;
    toolInput: string;
    toolInputText: string;
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
    tooltip: "#151515",
    tooltipText: "#eaeaea",
    activeTool: "#444444",
    activeToolText: "#ffffff",
    inactiveTool: "transparent",
    inactiveToolText: "#cccccc",
    hoverTool: "#444444",
    toolDivider: "#444444",
    menu: "#333333",
    menuText: "#ffffff",
    menuBorder: "#444444",
    hoverMenu: "#444444",
    toolInput: "#eeeeee",
    toolInputText: "#111111",
});
