import Icon from "@mdi/react";
import React, { FC, useCallback, useState } from "react";
import { ToolButton } from "./ToolButton";
import { mdiCheck, mdiMenuDown, mdiTextBoxOutline } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";
import { BoxVariant, BOX_VARIANTS } from "scribing";
import { useFlowLocale } from "../FlowLocaleScope";
import { ToolMenu } from "./ToolMenu";
import { ToolMenuItem } from "./ToolMenuItem";
import { getBoxVariantLocaleKey } from "../FlowLocale";

export const BoxVariantButton: FC<ToolbarProps> = ({commands, boundary, editingHost}) => {
    const [buttonRef, setButtonRef] = useState<HTMLElement | null>(null);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const locale = useFlowLocale();
    const toggleMenu = useCallback(() => setMenuOpen(before => !before), []);
    const closeMenu = useCallback(() => setMenuOpen(false), []);
    const applyVariant = useCallback((option: BoxVariant) => {
        closeMenu();
        commands.formatBox("variant", option);
        if (editingHost) {
            editingHost.focus();
        }
    }, [closeMenu, commands, editingHost]);
    const { variant } = commands.getBoxStyle();
    return (
        <>
            <ToolButton setRef={setButtonRef} onClick={toggleMenu} editingHost={editingHost}>
                <Icon path={mdiTextBoxOutline} size={0.75}/>
                <span style={{ margin: "0 0.5rem" }}>
                    {BOX_VARIANTS.map(option => (
                        <div 
                            key={option}
                            style={option === variant ? undefined : {
                                overflow: "hidden",
                                height: 0,
                            }}
                            children={locale[getBoxVariantLocaleKey(option)]}
                        />
                    ))}
                </span>
                <Icon path={mdiMenuDown} size={0.75}/>
            </ToolButton>
            {buttonRef && isMenuOpen && (
                <ToolMenu anchor={buttonRef} onClose={closeMenu} boundary={boundary}>
                    {BOX_VARIANTS.map(option => (
                        <ToolMenuItem key={option} onClick={applyVariant.bind(void(0), option)}>
                            <Icon
                                path={mdiCheck}
                                size={0.75}
                                style={{visibility: option === variant ? "visible" : "hidden"}}
                            />
                            <span style={{paddingLeft: "0.5rem", paddingRight: "1.5rem"}}>
                                {locale[getBoxVariantLocaleKey(option)]}
                            </span>
                        </ToolMenuItem>
                    ))}
                </ToolMenu>
            )}
        </>
    );
};
