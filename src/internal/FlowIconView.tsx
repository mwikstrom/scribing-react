import clsx from "clsx";
import React, { useMemo } from "react";
import { FlowIcon, PredefinedIcon } from "scribing";
import { flowNode } from "./FlowNodeComponent";
import { createUseFlowStyles } from "./JssTheming";
import { getTextStyleClassNames, textStyles } from "./utils/text-style-to-classes";
import { getTextCssProperties } from "./utils/text-style-to-css";
import { useParagraphTheme } from "./ParagraphThemeScope";

export const FlowIconView = flowNode<FlowIcon>((props, ref) => {
    const { node } = props;
    const { style: givenStyle, name: givenName } = node;
    const theme = useParagraphTheme();
    const style = useMemo(() => {
        let ambient = theme.getAmbientTextStyle();
        if (givenStyle.link) {
            ambient = ambient.merge(theme.getLinkStyle());
        }
        return ambient.merge(givenStyle);
    }, [givenStyle, theme]);
    const css = useMemo(() => getTextCssProperties(style, theme.getAmbientParagraphStyle()), [style, theme]);
    const classes = useStyles();
    const className = useMemo(() => {
        const resolvedName = PREDEFINED.get(givenName) ?? givenName;
        const iconClasses: string[] = [];

        if (/^@mdi\//.test(resolvedName)) {
            ensureMdiAvailable();
            iconClasses.push("mdi", resolvedName.replace(/^@mdi\//, "mdi-"));
        } else {
            console.warn("Unsupported icon name:", givenName);
            iconClasses.push(classes.unsupported);
        }

        return clsx(
            classes.root,
            ...getTextStyleClassNames(style, classes),
            ...iconClasses,
        );
    }, [style, classes, givenName]);

    return (
        <span ref={ref} className={className} style={css} contentEditable={false}/>
    );
});

const useStyles = createUseFlowStyles("FlowIcon", ({palette}) => ({
    ...textStyles(palette),
    root: {
        "&::before": {
            textDecoration: "inherit"
        }
    },
    unsupported: {}
}));


const _PREDEFINED: Record<PredefinedIcon, string> = Object.freeze({
    information: "@mdi/information-outline",
    warning: "@mdi/alert-outline",
    error: "@mdi/alert-octagon-outline",
    success: "@mdi/check-circle-outline",
});

const PREDEFINED: ReadonlyMap<string, string> = Object.freeze(new Map(Object.entries(_PREDEFINED)));

function ensureMdiAvailable() {
    if (document.querySelector("link[rel=stylesheet][href*=materialdesignicons]") === null) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/@mdi/font/css/materialdesignicons.min.css";
        document.head.append(link);
    }
}