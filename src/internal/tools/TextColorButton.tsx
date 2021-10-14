import Icon, { Stack } from "@mdi/react";
import React, { FC, ReactElement, useCallback, useState } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFormatColorFill, mdiColorHelper, mdiMenuDown } from "@mdi/js";
import { FlowPalette } from "../../FlowPalette";
import { TextStyleProps } from "scribing";
import { IconProps } from "@mdi/react/dist/IconProps";
import { useFlowPalette } from "../../FlowPaletteScope";
import { ToolbarProps } from "./Toolbar";
import { ToolMenu } from "./ToolMenu";
import { ToolMenuItem } from "./ToolMenuItem";

export const TextColorButton: FC<ToolbarProps> = ({commands}) => {
    const [buttonRef, setButtonRef] = useState<HTMLElement | null>(null);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const palette = useFlowPalette();
    const toggleMenu = useCallback(() => setMenuOpen(before => !before), []);
    const closeMenu = useCallback(() => setMenuOpen(false), []);
    const color = commands.getTextColor();
    let icon: ReactElement<IconProps> = <Icon path={mdiFormatColorFill}/>;

    if (color) {
        icon = (
            <Stack size={1}>
                {icon}
                <Icon 
                    path={mdiColorHelper}
                    color={palette[getPaletteColorFromTextColor(color)]}
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
                <ToolMenu anchor={buttonRef} onClose={closeMenu}>
                    <ToolMenuItem>Default</ToolMenuItem>
                </ToolMenu>
            )}
        </>
    );
};

const getPaletteColorFromTextColor = (
    color: Exclude<TextStyleProps["color"], undefined>
): keyof FlowPalette => {
    if (color === "default") {
        return "text";
    } else {
        return color;
    }
};
