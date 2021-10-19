import Icon, { Stack } from "@mdi/react";
import React, { FC, ReactElement, useCallback, useState } from "react";
import { ToolButton } from "./ToolButton";
import {
    mdiFormatColorFill,
    mdiColorHelper,
    mdiMenuDown,
    mdiCheckboxBlank,
    mdiCheck,
} from "@mdi/js";
import { FlowPalette } from "../../FlowPalette";
import { FlowColor, FLOW_COLORS } from "scribing";
import { IconProps } from "@mdi/react/dist/IconProps";
import { useFlowPalette } from "../../FlowPaletteScope";
import { ToolbarProps } from "./Toolbar";
import { ToolMenu } from "./ToolMenu";
import { ToolMenuItem } from "./ToolMenuItem";
import { getFlowColorLocaleKey, useFlowLocale } from "../..";

export const ColorButton: FC<ToolbarProps> = ({commands, boundary}) => {
    const [buttonRef, setButtonRef] = useState<HTMLElement | null>(null);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const palette = useFlowPalette();
    const locale = useFlowLocale();
    const toggleMenu = useCallback(() => setMenuOpen(before => !before), []);
    const closeMenu = useCallback(() => setMenuOpen(false), []);
    const applyColor = useCallback((option: FlowColor) => {
        closeMenu();
        commands.setColor(option);
    }, [closeMenu, commands]);
    const color = commands.getColor();
    let icon: ReactElement<IconProps> = <Icon size={1} path={mdiFormatColorFill}/>;

    if (color) {
        icon = (
            <Stack size={1}>
                {icon}
                <Icon 
                    path={mdiColorHelper}
                    color={palette[getPaletteColorFromFlowColor(color)]}
                />
            </Stack>
        );
    }

    return (
        <>
            <ToolButton setRef={setButtonRef} onClick={toggleMenu}>
                {icon}
                <Icon path={mdiMenuDown} size={0.75}/>
            </ToolButton>
            {buttonRef && isMenuOpen && (
                <ToolMenu anchor={buttonRef} onClose={closeMenu} boundary={boundary}>
                    {FLOW_COLORS.map(option => (
                        <ToolMenuItem key={option} onClick={applyColor.bind(void(0), option)}>
                            <ColorIcon color={option} checked={option === color}/>
                            <span style={{margin: "0 0.5rem"}}>
                                {locale[getFlowColorLocaleKey(option)]}
                            </span>
                        </ToolMenuItem>
                    ))}
                </ToolMenu>
            )}
        </>
    );
};

interface ColorIconProps {
    color: FlowColor;
    checked: boolean;
}

const ColorIcon: FC<ColorIconProps> = ({color, checked}) => {
    const palette = useFlowPalette();
    let icon = (
        <Icon
            size={1}
            path={mdiCheckboxBlank}
            color={palette[getPaletteColorFromFlowColor(color)]}
        />
    );

    if (checked) {
        icon = (
            <Stack size={1}>
                {icon}
                <Icon size={0.75} path={mdiCheck} color={palette.menuText}/>
            </Stack>
        );
    }

    return icon;
};

const getPaletteColorFromFlowColor = (color: FlowColor): keyof FlowPalette => {
    if (color === "default") {
        return "text";
    } else {
        return color;
    }
};
