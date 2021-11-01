import Icon from "@mdi/react";
import React, { FC, useCallback, useState } from "react";
import { ToolButton } from "./ToolButton";
import { mdiArchive, mdiArchiveEdit, mdiCheck, mdiMenuDown } from "@mdi/js";
import { useFlowLocale } from "../FlowLocaleScope";
import { ToolMenu } from "./ToolMenu";
import { ToolMenuItem } from "./ToolMenuItem";
import { getIconPackLocaleKey } from "../FlowLocale";
import { IconPack, ICON_PACKS } from "../IconPack";
import { makeJssId } from "../utils/make-jss-id";
import { createUseStyles } from "react-jss";

export interface IconPackSelectorProps {
    editingHost: HTMLElement | null;
    boundary?: HTMLElement | null;
    current?: IconPack;
    onChange?: (option: IconPack) => void;
}

export const IconPackSelector: FC<IconPackSelectorProps> = props => {
    const { boundary, editingHost, current = "predefined", onChange } = props;
    const [buttonRef, setButtonRef] = useState<HTMLElement | null>(null);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const locale = useFlowLocale();
    const toggleMenu = useCallback(() => setMenuOpen(before => !before), []);
    const closeMenu = useCallback(() => setMenuOpen(false), []);
    const classes = useStyles();
    const selectOption = useCallback((option: IconPack) => {
        if (onChange) {
            onChange(option);
        }
        closeMenu();
        if (editingHost) {
            editingHost.focus();
        }
    }, [closeMenu, editingHost]);
    return (
        <>
            <ToolButton setRef={setButtonRef} onClick={toggleMenu} editingHost={editingHost}>
                <Icon path={current === "custom" ? mdiArchiveEdit : mdiArchive} size={0.75}/>
                <span className={classes.label}>
                    {ICON_PACKS.map(option => (
                        <div 
                            key={option}
                            className={classes.option}
                            style={option === current ? undefined : {
                                overflow: "hidden",
                                height: 0,
                            }}
                            children={locale[getIconPackLocaleKey(option)]}
                        />
                    ))}
                </span>
                <Icon path={mdiMenuDown} size={1}/>
            </ToolButton>
            {buttonRef && isMenuOpen && (
                <ToolMenu anchor={buttonRef} onClose={closeMenu} boundary={boundary}>
                    {ICON_PACKS.map(option => (
                        <ToolMenuItem key={option} onClick={selectOption.bind(void(0), option)}>
                            <Icon
                                path={mdiCheck}
                                size={0.75}
                                style={{visibility: option === current ? "visible" : "hidden"}}
                            />
                            <span className={classes.option}>
                                {locale[getIconPackLocaleKey(option)]}
                            </span>
                        </ToolMenuItem>
                    ))}
                </ToolMenu>
            )}
        </>
    );
};

const useStyles = createUseStyles({
    label: {
        margin: "0 0.5rem",
    },
    option: {
        paddingLeft: "0.5rem",
        paddingRight: "1.5rem",
        whiteSpace: "pre"
    },
}, {
    generateId: makeJssId("Selector"),
});
