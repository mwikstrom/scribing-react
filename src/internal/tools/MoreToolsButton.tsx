import Icon from "@mdi/react";
import React, { FC, useCallback, useState } from "react";
import { ToolButton } from "./ToolButton";
import {
    mdiDotsVertical,
    mdiCheck, 
    mdiFunctionVariant, 
    mdiFormatPilcrow, 
    mdiFormatTextdirectionLToR, 
    mdiFormatTextdirectionRToL,
    mdiArrowExpandHorizontal,
} from "@mdi/js";
import { ToolbarProps } from "./Toolbar";
import { ToolMenu } from "./ToolMenu";
import { ToolMenuItem } from "./ToolMenuItem";
import { ToolMenuDivider } from "./ToolMenuDivider";
import { ScriptEditor } from "./ScriptEditor";
import { DynamicText, ParagraphStyleProps } from "scribing";
import { useFlowLocale } from "../FlowLocaleScope";

export const MoreToolsButton: FC<ToolbarProps> = ({commands, boundary, editingHost}) => {
    const [buttonRef, setButtonRef] = useState<HTMLElement | null>(null);
    const [isMenuOpen, setMenuOpen] = useState<boolean | "insert_dynamic_text">(false);
    const locale = useFlowLocale();
    const toggleMenu = useCallback(() => setMenuOpen(before => !before), []);
    const closeMenu = useCallback(() => setMenuOpen(false), []);
    
    const toggleFormattingMarks = useCallback(() => {
        commands.toggleFormattingMarks();
        closeMenu();
        if (editingHost) {
            editingHost.focus();
        }
    }, [commands, closeMenu, editingHost]);

    const toggleInlineBox = useCallback(() => {
        const { inline = true } = commands.getBoxStyle();
        commands.formatBox("inline", !inline);
        closeMenu();
        if (editingHost) {
            editingHost.focus();
        }
    }, [commands, closeMenu, editingHost]);

    const setReadingDirection = useCallback((value: Exclude<ParagraphStyleProps["direction"], undefined>) => {
        commands.setReadingDirection(value);
        closeMenu();
        if (editingHost) {
            editingHost.focus();
        }
    }, [commands, closeMenu, editingHost]);

    const beginInsertDynamicText = useCallback(() => {
        setMenuOpen("insert_dynamic_text");
        if (editingHost) {
            editingHost.focus();
        }
    }, [setMenuOpen, editingHost]);

    const insertDynamicText = useCallback((expression: string) => {
        commands.insertNode(new DynamicText({ expression, style: commands.getCaretStyle() }));
        closeMenu();
        if (editingHost) {
            editingHost.focus();
        }
    }, [commands, closeMenu, editingHost]);

    return (
        <>
            <ToolButton setRef={setButtonRef} onClick={toggleMenu} editingHost={editingHost}>
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
                    <ToolMenuItem disabled={!commands.isBox()} onClick={toggleInlineBox}>
                        <Icon
                            path={(commands.getBoxStyle().inline ?? true) ? mdiArrowExpandHorizontal : mdiCheck}
                            size={0.75}
                        />
                        <span style={{margin: "0 0.5rem"}}>
                            {locale.full_width_box}
                        </span>
                    </ToolMenuItem>
                    <ToolMenuDivider/>
                    <ToolMenuItem onClick={setReadingDirection.bind(void(0), "ltr")}>
                        <Icon
                            path={commands.getReadingDirection() === "ltr" ? mdiCheck : mdiFormatTextdirectionLToR}
                            size={0.75}
                        />
                        <span style={{margin: "0 0.5rem"}}>
                            {locale.ltr_reading_direction}
                        </span>
                    </ToolMenuItem>
                    <ToolMenuItem onClick={setReadingDirection.bind(void(0), "rtl")}>
                        <Icon
                            path={commands.getReadingDirection() === "rtl" ? mdiCheck : mdiFormatTextdirectionRToL}
                            size={0.75}
                        />
                        <span style={{margin: "0 0.5rem"}}>
                            {locale.rtl_reading_direction}
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
                            editingHost={editingHost}
                        />
                    )}
                />
            )}
        </>
    );
};
