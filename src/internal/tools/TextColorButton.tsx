import Icon, { Stack } from "@mdi/react";
import React, { FC, ReactElement } from "react";
import { ToolButton } from "../ToolButton";
import { mdiFormatColorFill, mdiColorHelper, mdiMenuDown } from "@mdi/js";
import { FlowPalette } from "../../FlowPalette";
import { TextStyleProps } from "scribing";
import { IconProps } from "@mdi/react/dist/IconProps";
import { useFlowPalette } from "../../FlowPaletteScope";
import { ToolbarProps } from "../Toolbar";

export const TextColorButton: FC<ToolbarProps> = ({commands}) => {
    const palette = useFlowPalette();
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
        <ToolButton>
            {icon}
            <Icon path={mdiMenuDown} size={0.75}/>
        </ToolButton>
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
