import Icon from "@mdi/react";
import React, { FC, useCallback, useState } from "react";
import { ToolButton } from "./ToolButton";
import { mdiDotsVertical, mdiCheck, mdiFunctionVariant, mdiFormatPilcrow } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";
import { ToolMenu } from "./ToolMenu";
import { ToolMenuItem } from "./ToolMenuItem";
import { useFlowLocale } from "../..";
import { ToolMenuDivider } from "./ToolMenuDivider";
import { ScriptEditor } from "./ScriptEditor";
import { DynamicText } from "scribing";

export const MoreToolsButton: FC<ToolbarProps> = ({commands, boundary}) => {
    const [buttonRef, setButtonRef] = useState<HTMLElement | null>(null);
    const [isMenuOpen, setMenuOpen] = useState<boolean | "insert_dynamic_text">(false);
    const locale = useFlowLocale();
    const toggleMenu = useCallback(() => setMenuOpen(before => !before), []);
    const closeMenu = useCallback(() => setMenuOpen(false), []);
    
    const toggleFormattingMarks = useCallback(() => {
        commands.toggleFormattingMarks();
        closeMenu();
    }, [commands, closeMenu]);

    const beginInsertDynamicText = useCallback(() => setMenuOpen("insert_dynamic_text"), [setMenuOpen]);
    const insertDynamicText = useCallback((expression: string) => {
        commands.insertNode(new DynamicText({ expression, style: commands.getCaretStyle() }));
        closeMenu();
    }, [commands, closeMenu]);

    return (
        <>
            <ToolButton setRef={setButtonRef} onClick={toggleMenu}>
                <Icon size={1} path={mdiDotsVertical}/>
            </ToolButton>
            {buttonRef && isMenuOpen === true && (
                <ToolMenu anchor={buttonRef} onClose={closeMenu} placement="bottom-end" boundary={boundary}>
                    <ToolMenuItem disabled={!commands.isCaret()} onClick={beginInsertDynamicText}>
                        <Icon path={mdiFunctionVariant} size={0.75}/>
                        <span style={{margin: "0 0.5rem"}}>
                            {locale.insert_dynamic_text}&hellip;
                        </span>
                    </ToolMenuItem>
                    <ToolMenuDivider/>
                    <ToolMenuItem onClick={toggleFormattingMarks}>
                        <Icon path={commands.getFormattingMarks() ? mdiCheck : mdiFormatPilcrow} size={0.75}/>
                        <span style={{margin: "0 0.5rem"}}>
                            {locale.show_formatting_marks}
                        </span>
                    </ToolMenuItem>
                </ToolMenu>
            )}
            {buttonRef && isMenuOpen === "insert_dynamic_text" && (
                <ToolMenu
                    anchor={buttonRef}
                    onClose={closeMenu}
                    placement="bottom"
                    closeOnMouseLeave={false}
                    boundary={boundary}
                    children={(
                        <ScriptEditor
                            onSave={insertDynamicText}
                            onCancel={closeMenu}
                        />
                    )}
                />
            )}
        </>
    );
};
