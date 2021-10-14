import Icon from "@mdi/react";
import React, { FC, useCallback, useState } from "react";
import { ToolButton } from "./ToolButton";
import { mdiCheck, mdiFormatText, mdiMenuDown } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";
import { ParagraphStyleVariant, PARAGRAPH_STYLE_VARIANTS } from "scribing";
import { useFlowLocale } from "../../FlowLocaleScope";
import { getParagraphVariantLocaleKey } from "../..";
import { ToolMenu } from "./ToolMenu";
import { ToolMenuItem } from "./ToolMenuItem";

export const ParagraphVariantButton: FC<ToolbarProps> = ({commands}) => {
    const [buttonRef, setButtonRef] = useState<HTMLElement | null>(null);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const locale = useFlowLocale();
    const toggleMenu = useCallback(() => setMenuOpen(before => !before), []);
    const closeMenu = useCallback(() => setMenuOpen(false), []);
    const applyVariant = useCallback((option: ParagraphStyleVariant) => {
        closeMenu();
        commands.setParagraphVariant(option);
    }, [closeMenu, commands]);
    const variant = commands.getParagraphVariant();
    return (
        <>
            <ToolButton setRef={setButtonRef} onClick={toggleMenu}>
                <Icon path={mdiFormatText} size={0.75}/>
                <span style={{ margin: "0 0.5rem" }}>
                    {PARAGRAPH_STYLE_VARIANTS.map(option => (
                        <div 
                            key={option}
                            style={option === variant ? undefined : {
                                overflow: "hidden",
                                height: 0,
                            }}
                            children={locale[getParagraphVariantLocaleKey(option)]}
                        />
                    ))}
                </span>
                <Icon path={mdiMenuDown} size={0.75}/>
            </ToolButton>
            {buttonRef && isMenuOpen && (
                <ToolMenu anchor={buttonRef} onClose={closeMenu}>
                    {PARAGRAPH_STYLE_VARIANTS.map(option => (
                        <ToolMenuItem key={option} onClick={applyVariant.bind(void(0), option)}>
                            <Icon
                                path={mdiCheck}
                                size={0.75}
                                style={{visibility: option === variant ? "visible" : "hidden"}}
                            />
                            <span style={{paddingLeft: "0.5rem", paddingRight: "1.5rem"}}>
                                {locale[getParagraphVariantLocaleKey(option)]}
                            </span>
                        </ToolMenuItem>
                    ))}
                </ToolMenu>
            )}
        </>
    );
};
