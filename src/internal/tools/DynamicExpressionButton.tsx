import Icon from "@mdi/react";
import React, { FC, useCallback, useState } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFunctionVariant, mdiMenuDown } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";
import { ToolMenu } from "./ToolMenu";
import { ScriptEditor } from "./ScriptEditor";

export const DynamicExpressionButton: FC<ToolbarProps> = ({commands, boundary, editingHost}) => {
    const [buttonRef, setButtonRef] = useState<HTMLElement | null>(null);
    const [isEditorOpen, setEditorOpen] = useState<boolean>(false);
    
    const toggleEditor = useCallback(() => setEditorOpen(before => !before), [setEditorOpen]);
    const closeEditor = useCallback(() => setEditorOpen(false), [setEditorOpen]);
        
    const setExpression = useCallback((script: string) => {
        commands.setDynamicExpression(script);
        closeEditor();
    }, [commands, closeEditor]);
    
    const expression = commands.getDynamicExpression();
    const disabled = !commands.isBox() && !commands.isDynamicText();
    const active = expression === void(0) ? void(0) : expression !== null;
    
    return (
        <>
            <ToolButton 
                setRef={setButtonRef}
                onClick={toggleEditor}
                active={active}
                disabled={disabled}
                editingHost={editingHost}
                children={(
                    <>
                        <Icon path={mdiFunctionVariant} size={1}/>
                        <Icon path={mdiMenuDown} size={0.75}/>
                    </>
                )}
            />
            {buttonRef && isEditorOpen && (
                <ToolMenu
                    anchor={buttonRef}
                    onClose={closeEditor}
                    placement="bottom"
                    closeOnMouseLeave={false}
                    boundary={boundary}
                    children={(
                        <ScriptEditor
                            value={expression ?? ""}
                            onSave={setExpression}
                            onCancel={closeEditor}
                            editingHost={editingHost}
                        />
                    )}
                />
            )}
        </>
    );
};
