import { mdiCheck, mdiClose } from "@mdi/js";
import Icon from "@mdi/react";
import clsx from "clsx";
import React, { FC, useCallback, useMemo, useState } from "react";
import { createUseFlowStyles } from "../JssTheming";
import { SYSTEM_FONT } from "../utils/system-font";
import { ToolButton } from "./ToolButton";

export interface InputEditorProps {
    value?: string;
    placeholder: string;
    onSave: (value: string) => void;
    onGetError?: (value: string) => string | null | undefined;
    onCancel: () => void;
    editingHost: HTMLElement | null;
}

export const InputEditor: FC<InputEditorProps> = props => {
    const {
        value: defaultValue = "", 
        placeholder,
        onSave, 
        onCancel, 
        editingHost,
        onGetError,
    } = props;
    const classes = useStyles();
    const [value, setValue] = useState(defaultValue);
    
    const error = useMemo(() => {
        if (onGetError) {
            return onGetError(value);
        } else {
            return null;
        }
    }, [value, onGetError]);

    const handleSave = useCallback(() => {
        if (!error) {
            onSave(value);
        }
    }, [onSave, error, value]);
    
    const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    }, [setValue]);

    const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            e.stopPropagation();
            e.preventDefault();
            onCancel();
        }

        if (e.key === "Enter") {
            e.stopPropagation();
            e.preventDefault();
            handleSave();
        }
    }, [handleSave, onCancel]);

    return (
        <div className={classes.root}>
            <div className={classes.inputRow}>
                <input
                    className={classes.input}
                    autoFocus
                    spellCheck={false}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                />
                <ToolButton disabled={!!error} onClick={handleSave} editingHost={editingHost}>
                    <Icon path={mdiCheck}/>
                </ToolButton>
                <ToolButton onClick={onCancel} editingHost={editingHost}>
                    <Icon path={mdiClose}/>
                </ToolButton>
            </div>
            <div className={clsx(classes.hint, error && value && classes.invalid)}>
                {error}
            </div>
        </div>
    );
};

const useStyles = createUseFlowStyles("InputEditor", ({palette}) => ({
    root: {
        display: "flex",
        flexDirection: "column",
        width: "calc(min(100vw,600px))",
        padding: 8,
    },
    inputRow: {
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
    },
    input: {
        flex: 1,
        backgroundColor: palette.toolInput,
        color: palette.toolInputText,
        padding: 4,
        fontFamily: SYSTEM_FONT,
        border: "none",
        borderRadius: 0,
        outline: "none",
        boxSizing: "border-box",
        marginRight: 2,
    },
    hint: {
        overflow: "hidden",
        maxHeight: 0,
        opacity: 0,
        paddingTop: 0,
        color: palette.menuText,
        transition: "all ease-in-out 0.1s",
    },
    invalid: {
        maxHeight: "1.5em",
        paddingTop: 4,
        opacity: 1,
    },
}));