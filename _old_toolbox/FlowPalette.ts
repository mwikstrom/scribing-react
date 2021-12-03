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
    menuScrollbar: string;
    hoverMenu: string;
    toolInput: string;
    toolInputText: string;
    selection: string;
    selectionText: string;
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
    menuScrollbar: "#777777",
    hoverMenu: "#444444",
    toolInput: "#eeeeee",
    toolInputText: "#111111",
    selection: "#3390FF",
    selectionText: "#ffffff",
    inactiveSelection: "#C8C8C8",
    inactiveSelectionText: "#000000",
});
