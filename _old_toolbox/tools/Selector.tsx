import Icon from "@mdi/react";
import React, { ReactElement, useCallback, useState } from "react";
import { ToolButton } from "./ToolButton";
import { mdiCheck, mdiMenuDown } from "@mdi/js";
import { ToolMenu } from "./ToolMenu";
import { ToolMenuItem } from "./ToolMenuItem";
import { makeJssId } from "../utils/make-jss-id";
import { createUseStyles } from "react-jss";

export interface SelectorProps<T> {
    editingHost: HTMLElement | null;
    boundary?: HTMLElement | null;
    current?: T;
    options: readonly T[];
    icon?: string;
    loading?: boolean;
    onChange: (option: T) => void;
    getLabel?: (option: T) => string;
}

export function Selector<T extends string>(props: SelectorProps<T>): ReactElement {
    const {
        boundary,
        editingHost,
        current,
        options,
        icon = "",
        onChange,
        getLabel = option => option,
    } = props;
    const [buttonRef, setButtonRef] = useState<HTMLElement | null>(null);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const toggleMenu = useCallback(() => setMenuOpen(before => !before), []);
    const closeMenu = useCallback(() => setMenuOpen(false), []);
    const classes = useStyles();
    const selectOption = useCallback((option: T) => {
        if (onChange) {
            onChange(option);
        }
        closeMenu();
    }, [closeMenu, editingHost]);
    return (
        <>
            <ToolButton setRef={setButtonRef} onClick={toggleMenu} editingHost={editingHost}>
                { icon && <Icon path={icon} size={0.75}/> }
                <span className={classes.label}>
                    {options.map(option => (
                        <div 
                            key={option}
                            className={classes.option}
                            style={option === current ? undefined : {
                                overflow: "hidden",
                                height: 0,
                            }}
                            children={getLabel(option)}
                        />
                    ))}
                </span>
                <Icon path={mdiMenuDown} size={1}/>
            </ToolButton>
            {buttonRef && isMenuOpen && (
                <ToolMenu anchor={buttonRef} onClose={closeMenu} boundary={boundary}>
                    {options.map(option => (
                        <ToolMenuItem key={option} onClick={selectOption.bind(void(0), option)}>
                            <Icon
                                path={mdiCheck}
                                size={0.75}
                                style={{visibility: option === current ? "visible" : "hidden"}}
                            />
                            <span className={classes.option}>
                                {getLabel(option)}
                            </span>
                        </ToolMenuItem>
                    ))}
                </ToolMenu>
            )}
        </>
    );
}

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
