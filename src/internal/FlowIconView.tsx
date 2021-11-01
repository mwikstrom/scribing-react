import clsx from "clsx";
import React, { useCallback, useMemo, MouseEvent, useState } from "react";
import { FlowIcon, PredefinedIconType } from "scribing";
import { flowNode } from "./FlowNodeComponent";
import { createUseFlowStyles } from "./JssTheming";
import { getTextStyleClassNames, textStyles } from "./utils/text-style-to-classes";
import { getTextCssProperties } from "./utils/text-style-to-css";
import { useParagraphTheme } from "./ParagraphThemeScope";
import Icon from "@mdi/react";
import { mdiAlertOctagonOutline, mdiAlertOutline, mdiCheckCircleOutline, mdiInformationOutline } from "@mdi/js";

export const FlowIconView = flowNode<FlowIcon>((props, outerRef) => {
    const { node } = props;
    const { style: givenStyle, path: givenPath } = node;
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

    const [rootElem, setRootElem] = useState<HTMLElement | null>(null);
    const ref = useCallback((dom: HTMLElement | null) => {
        outerRef(dom);
        setRootElem(dom);
    }, [outerRef]);

    const path = useMemo(() => {
        if (givenPath === "warning") {
            return mdiAlertOutline;
        } else if (givenPath === "error") {
            return mdiAlertOctagonOutline;
        } else if (givenPath === "information") {
            return mdiInformationOutline;
        } else if (givenPath === "success") {
            return mdiCheckCircleOutline;
        } else if (PredefinedIconType.test(givenPath)) {
            console.warn("Unsupported predefined icon: ", givenPath);
            return "";
        } else {
            return givenPath;
        }
    }, [givenPath]);

    const className = useMemo(() => clsx(
        classes.root,
        ...getTextStyleClassNames(style, classes)
    ), [style, classes]);

    const onClick = useCallback((e: MouseEvent<HTMLElement>) => {
        const domSelection = document.getSelection();
        if (domSelection && rootElem) {
            if (domSelection && domSelection.rangeCount === 1) {
                domSelection.getRangeAt(0).selectNode(rootElem);
                e.stopPropagation();
            }
        }
    }, [rootElem]);
    return (
        <span ref={ref} className={className} style={css} contentEditable={false} onClick={onClick}>
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
        display: "inline",
        width: "1.2em",
        height: "1.2em",
    },
    selected: {
        outlineStyle: "dashed",
        outlineWidth: 1,
        outlineColor: palette.subtle,
        outlineOffset: "0.2rem",    
    },
}));
