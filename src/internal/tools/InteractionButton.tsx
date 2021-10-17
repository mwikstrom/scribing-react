import Icon from "@mdi/react";
import React, { CSSProperties, FC, useCallback, useState } from "react";
import { ToolButton } from "./ToolButton";
import {
    mdiGestureTapButton,
    mdiMenuDown,
    mdiCheck,
} from "@mdi/js";
import { ToolbarProps } from "./Toolbar";
import { ToolMenu } from "./ToolMenu";
import { ToolMenuItem } from "./ToolMenuItem";
import { OpenUrl, RunScript } from "scribing";
import { useFlowLocale } from "../../FlowLocaleScope";

export const InteractionButton: FC<ToolbarProps> = ({commands}) => {
    const locale = useFlowLocale();
    const [buttonRef, setButtonRef] = useState<HTMLElement | null>(null);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const toggleMenu = useCallback(() => setMenuOpen(before => !before), []);
    const closeMenu = useCallback(() => setMenuOpen(false), []);
    const clearInteraction = useCallback(() => {
        commands.setInteraction(null);
        closeMenu();
    }, [commands, closeMenu]);
    const interaction = commands.getInteraction();
    const active = interaction === void(0) ? void(0) : interaction !== null;
    return (
        <>
            <ToolButton setRef={setButtonRef} onClick={toggleMenu} active={active}>
                <Icon path={mdiGestureTapButton} size={1}/>
                <Icon path={mdiMenuDown} size={0.75}/>
            </ToolButton>
            {buttonRef && isMenuOpen && (
                <ToolMenu anchor={buttonRef} onClose={closeMenu}>
                    <ToolMenuItem onClick={clearInteraction}>
                        <Icon path={mdiCheck} size={0.75} style={visibleIf(interaction === null)}/>
                        <span style={{margin: "0 0.5rem"}}>{locale.not_interactive}</span>
                    </ToolMenuItem>
                    <ToolMenuItem>
                        <Icon path={mdiCheck} size={0.75} style={visibleIf(interaction instanceof OpenUrl)}/>
                        <span style={{margin: "0 0.5rem"}}>{locale.open_web_page}&hellip;</span>
                    </ToolMenuItem>
                    <ToolMenuItem>
                        <Icon path={mdiCheck} size={0.75} style={visibleIf(interaction instanceof RunScript)}/>
                        <span style={{margin: "0 0.5rem"}}>{locale.run_script}&hellip;</span>
                    </ToolMenuItem>
                </ToolMenu>
            )}
        </>
    );
};

const visibleIf = (condition: boolean): CSSProperties => ({
    visibility: condition ? "visible" : "hidden",
});
