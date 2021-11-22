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
    mdiTextBoxOutline,
    mdiSpellcheck,
    mdiCreation,
    mdiImage,
    mdiCodeTags,
    mdiTable,
    mdiTableMergeCells,
    mdiTableRowRemove,
    mdiTableRowPlusBefore,
    mdiTableRowPlusAfter,
    mdiTableSplitCell,
    mdiTableColumnRemove,
    mdiTableColumnPlusBefore,
    mdiTableColumnPlusAfter,
} from "@mdi/js";
import { ToolbarProps } from "./Toolbar";
import { ToolMenu } from "./ToolMenu";
import { ToolMenuItem } from "./ToolMenuItem";
import { ToolMenuDivider } from "./ToolMenuDivider";
import { ScriptEditor } from "./ScriptEditor";
import { 
    DynamicText, 
    FlowIcon, 
    FlowImage, 
    ParagraphStyleProps, 
    TextStyle 
} from "scribing";
import { useFlowLocale } from "../FlowLocaleScope";
import { IconChooser } from "./IconChooser";
import { fileOpen } from "browser-fs-access";
import { createImageSource } from "../utils/create-image-source";
import { InputEditor } from "./InputEditor";
import { TableSizeSelector } from "./TableSizeSelector";

export const MoreToolsButton: FC<ToolbarProps> = ({commands, boundary, editingHost}) => {
    const [buttonRef, setButtonRef] = useState<HTMLElement | null>(null);
    const [isMenuOpen, setMenuOpen] = useState<
        boolean | 
        "insert_dynamic_text" | 
        "icon" | 
        "insert_markup" | 
        "insert_table"
    >(false);
    const locale = useFlowLocale();
    const toggleMenu = useCallback(() => setMenuOpen(before => !before), []);
    const closeMenu = useCallback(() => setMenuOpen(false), []);
    
    const toggleFormattingMarks = useCallback(() => {
        commands.toggleFormattingMarks();
        closeMenu();
    }, [commands, closeMenu, editingHost]);

    const toggleSpellcheck = useCallback(() => {
        commands.toggleSpellcheck();
        closeMenu();
    }, [commands, closeMenu, editingHost]);

    const toggleInlineBox = useCallback(() => {
        const { inline = true } = commands.getBoxStyle();
        commands.formatBox("inline", !inline);
        closeMenu();
    }, [commands, closeMenu, editingHost]);

    const setReadingDirection = useCallback((value: Exclude<ParagraphStyleProps["direction"], undefined>) => {
        commands.setReadingDirection(value);
        closeMenu();
    }, [commands, closeMenu, editingHost]);

    const insertBox = useCallback(() => {
        commands.insertBox();
        closeMenu();
    }, [commands, closeMenu, editingHost]);

    const beginInsertDynamicText = useCallback(() => {
        setMenuOpen("insert_dynamic_text");
    }, [setMenuOpen, editingHost]);

    const insertDynamicText = useCallback((expression: string) => {
        commands.insertNode(new DynamicText({ expression, style: commands.getCaretStyle() }));
        closeMenu();
    }, [commands, closeMenu, editingHost]);

    const beginInsertMarkup = useCallback(() => {
        setMenuOpen("insert_markup");
    }, [setMenuOpen, editingHost]);
    
    const insertMarkup = useCallback((tag: string) => {
        commands.insertMarkup(tag);
        closeMenu();
    }, [commands, closeMenu, editingHost]);

    const beginInsertTable = useCallback(() => {
        setMenuOpen("insert_table");
    }, [setMenuOpen, editingHost]);
    
    const insertTable = useCallback((cols: number, rows: number) => {
        commands.insertTable(cols, rows);
        closeMenu();
    }, [commands, closeMenu, editingHost]);

    const beginIcon = useCallback(() => {
        setMenuOpen("icon");
    }, [setMenuOpen, editingHost]);

    const applyIcon = useCallback((data: string) => {
        if (commands.isIcon()) {
            commands.setIcon(data);
        } else {
            commands.insertNode(new FlowIcon({ data, style: TextStyle.empty }));
        }
        closeMenu();
    }, [commands, closeMenu, editingHost]);

    const setOrInsertImage = useCallback(async () => {
        closeMenu();
        const blob = await fileOpen({mimeTypes: ["image/*"]});
        const uploadId = commands.uploadAsset(blob);
        const source = await createImageSource(blob, uploadId);

        if (commands.isImage()) {
            commands.setImageSource(source);
        } else {
            commands.insertNode(new FlowImage({ source, style: TextStyle.empty }));
        }
    }, [commands, closeMenu, editingHost]);

    const insertRowAbove = useCallback(() => {
        closeMenu();
    }, [commands, closeMenu]);

    const insertRowBelow = useCallback(() => {
        closeMenu();
    }, [commands, closeMenu]);

    const insertColumnBefore = useCallback(() => {
        closeMenu();
    }, [commands, closeMenu]);

    const insertColumnAfter = useCallback(() => {
        closeMenu();
    }, [commands, closeMenu]);

    const mergeCells = useCallback(() => {
        commands.mergeTableCells();
        closeMenu();
    }, [commands, closeMenu]);

    const splitCell = useCallback(() => {
        commands.splitTableCell();
        closeMenu();
    }, [commands, closeMenu]);

    const removeRow = useCallback(() => {
        closeMenu();
    }, [commands, closeMenu]);

    const removeColumn = useCallback(() => {
        closeMenu();
    }, [commands, closeMenu]);

    return (
        <>
            <ToolButton setRef={setButtonRef} onClick={toggleMenu} editingHost={editingHost}>
                <Icon size={1} path={mdiDotsVertical}/>
            </ToolButton>
            {buttonRef && isMenuOpen === true && (
                <ToolMenu anchor={buttonRef} onClose={closeMenu} placement="bottom-end" boundary={boundary}>
                    {commands.isTableSelection() ? (
                        <>
                            <ToolMenuItem onClick={insertRowAbove}>
                                <Icon path={mdiTableRowPlusBefore} size={0.75}/>
                                <span style={{margin: "0 0.5rem"}}>
                                    {locale.insert_row_above}
                                </span>
                            </ToolMenuItem>
                            <ToolMenuItem onClick={insertRowBelow}>
                                <Icon path={mdiTableRowPlusAfter} size={0.75}/>
                                <span style={{margin: "0 0.5rem"}}>
                                    {locale.insert_row_below}
                                </span>
                            </ToolMenuItem>
                            <ToolMenuItem onClick={insertColumnBefore}>
                                <Icon path={mdiTableColumnPlusBefore} size={0.75}/>
                                <span style={{margin: "0 0.5rem"}}>
                                    {locale.insert_column_before}
                                </span>
                            </ToolMenuItem>
                            <ToolMenuItem onClick={insertColumnAfter}>
                                <Icon path={mdiTableColumnPlusAfter} size={0.75}/>
                                <span style={{margin: "0 0.5rem"}}>
                                    {locale.insert_column_after}
                                </span>
                            </ToolMenuItem>
                            <ToolMenuDivider/>
                            <ToolMenuItem onClick={mergeCells}>
                                <Icon path={mdiTableMergeCells} size={0.75}/>
                                <span style={{margin: "0 0.5rem"}}>
                                    {locale.merge_cells}
                                </span>
                            </ToolMenuItem>
                            <ToolMenuItem onClick={splitCell}>
                                <Icon path={mdiTableSplitCell} size={0.75}/>
                                <span style={{margin: "0 0.5rem"}}>
                                    {locale.split_cell}
                                </span>
                            </ToolMenuItem>
                            <ToolMenuDivider/>
                            <ToolMenuItem onClick={removeRow}>
                                <Icon path={mdiTableRowRemove} size={0.75}/>
                                <span style={{margin: "0 0.5rem"}}>
                                    {locale.delete_row}
                                </span>
                            </ToolMenuItem>
                            <ToolMenuItem onClick={removeColumn}>
                                <Icon path={mdiTableColumnRemove} size={0.75}/>
                                <span style={{margin: "0 0.5rem"}}>
                                    {locale.delete_column}
                                </span>
                            </ToolMenuItem>
                        </>
                    ) : (
                        <>
                            <ToolMenuItem disabled={commands.isMultiRange()} onClick={insertBox}>
                                <Icon path={mdiTextBoxOutline} size={0.75}/>
                                <span style={{margin: "0 0.5rem"}}>
                                    {locale.insert_box}
                                </span>
                            </ToolMenuItem>
                            <ToolMenuItem disabled={!commands.isCaret()} onClick={beginInsertDynamicText}>
                                <Icon path={mdiFunctionVariant} size={0.75}/>
                                <span style={{margin: "0 0.5rem"}}>
                                    {locale.insert_dynamic_text}&hellip;
                                </span>
                            </ToolMenuItem>
                            <ToolMenuItem disabled={!commands.isCaret() && !commands.isIcon()} onClick={beginIcon}>
                                <Icon path={mdiCreation} size={0.75}/>
                                <span style={{margin: "0 0.5rem"}}>
                                    {commands.isIcon() ? locale.change_icon : locale.insert_icon}&hellip;
                                </span>
                            </ToolMenuItem>
                            <ToolMenuItem
                                disabled={!commands.isCaret() && !commands.isImage()}
                                onClick={setOrInsertImage}
                            >
                                <Icon path={mdiImage} size={0.75}/>
                                <span style={{margin: "0 0.5rem"}}>
                                    {commands.isImage() ? locale.change_image : locale.insert_image}&hellip;
                                </span>
                            </ToolMenuItem>
                            <ToolMenuItem disabled={!commands.isCaret()} onClick={beginInsertTable}>
                                <Icon path={mdiTable} size={0.75}/>
                                <span style={{margin: "0 0.5rem"}}>
                                    {locale.insert_table}&hellip;
                                </span>
                            </ToolMenuItem>
                            <ToolMenuItem onClick={beginInsertMarkup}>
                                <Icon path={mdiCodeTags} size={0.75}/>
                                <span style={{margin: "0 0.5rem"}}>
                                    {locale.insert_markup}&hellip;
                                </span>
                            </ToolMenuItem>
                        </>
                    )}
                    {commands.isBox() && (
                        <>
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
                        </>
                    )}
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
                    <ToolMenuItem onClick={toggleSpellcheck}>
                        <Icon path={commands.isSpellcheckEnabled() ? mdiCheck : mdiSpellcheck} size={0.75}/>
                        <span style={{margin: "0 0.5rem"}}>
                            {locale.enable_spell_check}
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
            {buttonRef && isMenuOpen === "insert_table" && (
                <ToolMenu
                    anchor={buttonRef}
                    onClose={closeMenu}
                    placement="bottom"
                    closeOnMouseLeave={false}
                    boundary={boundary}
                    children={<TableSizeSelector onSelected={insertTable}/>}
                />
            )}
            {buttonRef && isMenuOpen === "insert_markup" && (
                <ToolMenu
                    anchor={buttonRef}
                    onClose={closeMenu}
                    placement="bottom"
                    closeOnMouseLeave={false}
                    boundary={boundary}
                    children={(
                        <InputEditor
                            placeholder={locale.enter_tag_name}
                            onSave={insertMarkup}
                            onCancel={closeMenu}
                            editingHost={editingHost}
                        />
                    )}
                />
            )}
            {buttonRef && isMenuOpen === "icon" && (
                <ToolMenu
                    anchor={buttonRef}
                    onClose={closeMenu}
                    placement="bottom"
                    closeOnMouseLeave={false}
                    boundary={boundary}
                    children={(
                        <IconChooser
                            editingHost={editingHost}
                            boundary={boundary}
                            current={commands.getIcon()}
                            onIconSelected={applyIcon}
                        />
                    )}
                />
            )}
        </>
    );
};
