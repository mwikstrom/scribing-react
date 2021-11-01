import clsx from "clsx";
import React, { useCallback, useMemo, useState, MouseEvent } from "react";
import { FlowIcon, PredefinedIcon } from "scribing";
import { flowNode } from "./FlowNodeComponent";
import { createUseFlowStyles } from "./JssTheming";
import { getTextStyleClassNames, textStyles } from "./utils/text-style-to-classes";
import { getTextCssProperties } from "./utils/text-style-to-css";
import { useParagraphTheme } from "./ParagraphThemeScope";
import Icon from "@mdi/react";
import { mdiAlertOctagonOutline, mdiAlertOutline, mdiCheckCircleOutline, mdiInformationOutline } from "@mdi/js";
import { useEditMode } from "./EditModeScope";
import { useFlowCaretContext } from "./FlowCaretScope";

export const FlowIconView = flowNode<FlowIcon>((props, outerRef) => {
    const { node, selection } = props;
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

    const selected = selection === true;
    const editMode = useEditMode();
    const { native: nativeSelection } = useFlowCaretContext();
    const className = clsx(
        classes.root,
        ...getTextStyleClassNames(style, classes),
        selected && !nativeSelection && (editMode === "inactive" ? classes.selectedInactive : classes.selected),
        !path && classes.empty,
    );

    const [rootElem, setRootElem] = useState<HTMLElement | null>(null);
    const ref = useCallback((dom: HTMLElement | null) => {
        outerRef(dom);
        setRootElem(dom);
    }, [outerRef]);
    
    const onDoubleClick = useCallback((e: MouseEvent<HTMLElement>) => {        
        const domSelection = document.getSelection();
        if (domSelection && rootElem) {
            if (domSelection.rangeCount === 0) {
                domSelection.addRange(document.createRange());
            }
            domSelection.getRangeAt(0).selectNode(rootElem);
            e.stopPropagation();
        }
    }, [rootElem]);

    const onClick = useCallback((e: MouseEvent<HTMLElement>) => {        
        const domSelection = document.getSelection();
        if (domSelection && rootElem) {
            const { parentElement } = rootElem;
            if (parentElement) {
                let childOffset = 0;
                for (let prev = rootElem.previousSibling; prev; prev = prev.previousSibling) {
                    ++childOffset;
                }
                const { left, width } = rootElem.getBoundingClientRect();
                if (e.clientX >= left + width / 2) {
                    ++childOffset;
                }
                if (e.shiftKey) {
                    domSelection.extend(parentElement, childOffset);
                } else {
                    domSelection.setBaseAndExtent(parentElement, childOffset, parentElement, childOffset);
                }
                e.stopPropagation();
            }
        }
    }, [rootElem]);

    return (
        <span 
            ref={ref}
            className={className}
            style={css}
            contentEditable={false}
            onDoubleClick={onDoubleClick}
            onClick={onClick}
            children={<Icon path={path} className={classes.icon}/>}
        />
    );
});

const useStyles = createUseFlowStyles("FlowIcon", ({palette}) => ({
    ...textStyles(palette),
    root: {
        display: "inline",
        cursor: "text",
    },
    selected: {
        backgroundColor: palette.selection,
        color: palette.selectionText,
    },
    selectedInactive: {
        backgroundColor: palette.inactiveSelection,
        color: palette.inactiveSelectionText,
    },
    icon: {
        display: "inline-block",
        verticalAlign: "text-bottom",
        width: "1.3em",
        height: "1.3em",
    },
    empty: {        
        backgroundImage: `repeating-linear-gradient(
            -45deg,
            currentcolor 0px,
            currentcolor 3px,
            transparent 3px,
            transparent 6px
        )`,
    }
}));

const ICON_NAME_PATTERN = /^[a-z-]+$/i;

const PREDEFINED_ICON_PATHS: Readonly<Record<PredefinedIcon, string>> = Object.freeze({
    information: mdiInformationOutline,
    success: mdiCheckCircleOutline,
    warning: mdiAlertOutline,
    error: mdiAlertOctagonOutline,
});
