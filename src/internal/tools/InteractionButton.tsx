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
import { OpenUrlEditor } from "./OpenUrlEditor";
import { ScriptEditor } from "./ScriptEditor";

export const InteractionButton: FC<ToolbarProps> = ({commands}) => {
    const locale = useFlowLocale();
    const [buttonRef, setButtonRef] = useState<HTMLElement | null>(null);
    const [isMenuOpen, setMenuOpen] = useState<boolean | "url" | "script">(false);
    
    const toggleMenu = useCallback(() => setMenuOpen(before => !before), [setMenuOpen]);
    const editUrl = useCallback(() => setMenuOpen("url"), [setMenuOpen]);
    const editScript = useCallback(() => setMenuOpen("script"), [setMenuOpen]);
    const closeMenu = useCallback(() => setMenuOpen(false), [setMenuOpen]);
    
    const clearInteraction = useCallback(() => {
        commands.setInteraction(null);
        closeMenu();
    }, [commands, closeMenu]);
    
    const setOpenUrl = useCallback((url: string) => {
        commands.setInteraction(new OpenUrl({ url }));
        closeMenu();
    }, [commands, closeMenu]);
    
    const setRunScript = useCallback((script: string) => {
        commands.setInteraction(new RunScript({ script }));
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
            {buttonRef && isMenuOpen === true && (
                <ToolMenu anchor={buttonRef} onClose={closeMenu}>
                    <ToolMenuItem onClick={clearInteraction}>
                        <Icon path={mdiCheck} size={0.75} style={visibleIf(interaction === null)}/>
                        <span style={{margin: "0 0.5rem"}}>{locale.not_interactive}</span>
                    </ToolMenuItem>
                    <ToolMenuItem onClick={editUrl}>
                        <Icon path={mdiCheck} size={0.75} style={visibleIf(interaction instanceof OpenUrl)}/>
                        <span style={{margin: "0 0.5rem"}}>{locale.open_web_page}&hellip;</span>
                    </ToolMenuItem>
                    <ToolMenuItem onClick={editScript}>
                        <Icon path={mdiCheck} size={0.75} style={visibleIf(interaction instanceof RunScript)}/>
                        <span style={{margin: "0 0.5rem"}}>{locale.run_script}&hellip;</span>
                    </ToolMenuItem>
                </ToolMenu>
            )}
            {buttonRef && isMenuOpen === "url" && (
                <ToolMenu anchor={buttonRef} onClose={closeMenu} placement="bottom" closeOnMouseLeave={false}>
                    <OpenUrlEditor
                        value={interaction instanceof OpenUrl ? interaction.url : ""}
                        onSave={setOpenUrl}
                        onCancel={closeMenu}
                    />
                </ToolMenu>
            )}
            {buttonRef && isMenuOpen === "script" && (
                <ToolMenu anchor={buttonRef} onClose={closeMenu} placement="bottom" closeOnMouseLeave={false}>
                    <ScriptEditor
                        value={interaction instanceof RunScript ? interaction.script : ""}
                        onSave={setRunScript}
                        onCancel={closeMenu}
                    />
                </ToolMenu>
            )}
        </>
    );
};

const visibleIf = (condition: boolean): CSSProperties => ({
    visibility: condition ? "visible" : "hidden",
});
