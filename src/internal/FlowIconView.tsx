import clsx from "clsx";
import React, { useMemo } from "react";
import { FlowIcon, PredefinedIcon } from "scribing";
import { flowNode } from "./FlowNodeComponent";
import { createUseFlowStyles } from "./JssTheming";
import { getTextStyleClassNames, textStyles } from "./utils/text-style-to-classes";
import { getTextCssProperties } from "./utils/text-style-to-css";
import { useParagraphTheme } from "./ParagraphThemeScope";
import Icon from "@mdi/react";
import { mdiAlertOctagonOutline, mdiAlertOutline, mdiCheckCircleOutline, mdiInformationOutline } from "@mdi/js";

export const FlowIconView = flowNode<FlowIcon>((props, ref) => {
    const { node } = props;
    const { style: givenStyle, data } = node;
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
    const path = useMemo(() => {
        if (data in PREDEFINED_ICON_PATHS) {
            return PREDEFINED_ICON_PATHS[data as PredefinedIcon];
        } else if (ICON_NAME_PATTERN.test(data)) {
            console.warn("Unsupported icon: ", data);
            return "";
        } else {
            return data;
        }
    }, [data]);

    const className = useMemo(() => clsx(
        classes.root,
        ...getTextStyleClassNames(style, classes)
    ), [style, classes]);

    return (
        <span ref={ref} className={className} style={css} contentEditable={false}>
            <Icon path={path} className={classes.icon}/>
        </span>
    );
});

const useStyles = createUseFlowStyles("FlowIcon", ({palette}) => ({
    ...textStyles(palette),
    root: {
        display: "inline",
    },
    icon: {
        display: "inline-block",
        verticalAlign: "text-bottom",
        width: "1.3em",
        height: "1.3em",
    },
}));

const ICON_NAME_PATTERN = /^[a-z-]+$/i;

const PREDEFINED_ICON_PATHS: Readonly<Record<PredefinedIcon, string>> = Object.freeze({
    information: mdiInformationOutline,
    success: mdiCheckCircleOutline,
    warning: mdiAlertOutline,
    error: mdiAlertOctagonOutline,
});
