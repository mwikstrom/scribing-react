import Icon from "@mdi/react";
import React, { CSSProperties, FC, useCallback, useState } from "react";
import { ToolButton } from "./ToolButton";
import { mdiDotsVertical, mdiCheck } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";
import { ToolMenu } from "./ToolMenu";
import { ToolMenuItem } from "./ToolMenuItem";
import { useFlowLocale } from "../..";

export const MoreToolsButton: FC<ToolbarProps> = ({commands}) => {
    const [buttonRef, setButtonRef] = useState<HTMLElement | null>(null);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const locale = useFlowLocale();
    const toggleMenu = useCallback(() => setMenuOpen(before => !before), []);
    const closeMenu = useCallback(() => setMenuOpen(false), []);
    const toggleFormattingMarks = useCallback(() => {
        commands.toggleFormattingMarks();
        closeMenu();
    }, [commands, closeMenu]);

    return (
        <>
            <ToolButton setRef={setButtonRef} onClick={toggleMenu}>
                <Icon size={1} path={mdiDotsVertical}/>
            </ToolButton>
            {buttonRef && isMenuOpen && (
                <ToolMenu anchor={buttonRef} onClose={closeMenu}>
                    <ToolMenuItem onClick={toggleFormattingMarks}>
                        <Icon path={mdiCheck} size={0.75} style={visibleIf(commands.getFormattingMarks())}/>
                        <span style={{margin: "0 0.5rem"}}>
                            {locale.show_formatting_marks}
                        </span>
                    </ToolMenuItem>
                </ToolMenu>
            )}
        </>
    );
};

const visibleIf = (condition: boolean): CSSProperties => ({
    visibility: condition ? "visible" : "hidden",
});
