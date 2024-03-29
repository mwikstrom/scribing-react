import { createUseFlowStyles } from "./JssTheming";

export const useMarkupStyles = createUseFlowStyles("Markup", ({palette, typography}) => ({
    root: {
        display: "inline-block",
        cursor: "default",
        textIndent: 0,
        color: palette.text,
        fontWeight: "normal",
        border: `1px solid ${palette.subtle}`,
        borderBottomWidth: 2,
        "&$block": {
            display: "block",
        },
    },
    block: {},
    defaultContent: {
        whiteSpace: "pre",
        fontFamily: typography.monospace,
        padding: "0.2rem 0.4rem",
        marginLeft: "0.1rem",
        marginRight: "0.2rem",
    },
    customContent: {
        fontFamily: typography.ui,
        fontSize: "1rem",
        cursor: "initial",
    },
    broken: {
        color: palette.error,
        borderColor: palette.error,
    },
    syntax: {
        color: palette.subtle,  
    },
    startTag: {
        borderTopRightRadius: "1em",
        borderBottomRightRadius: "1em",
        paddingRight: "0.6rem",
    },
    endTag: {
        borderTopLeftRadius: "1em",
        borderBottomLeftRadius: "1em",
        paddingLeft: "0.6rem",
    },
    emptyTag: {
        borderRadius: "0.4em",
    },
    selected: {
        backgroundColor: palette.selection,
        color: palette.selectionText,
        borderColor: palette.selectionText,
        outline: `1px solid ${palette.selection}`,
    },
    selectedInactive: {
        backgroundColor: palette.inactiveSelection,
        color: palette.inactiveSelectionText,
        borderColor: palette.inactiveSelectionText,
        outline: `1px solid ${palette.inactiveSelection}`,
    },
    clickable: {
        cursor: "pointer",
    },
    pending: {
        cursor: "wait",
    },
}));
