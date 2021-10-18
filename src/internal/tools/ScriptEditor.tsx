import { mdiCheck, mdiClose } from "@mdi/js";
import Icon from "@mdi/react";
import clsx from "clsx";
import TextareaAutosize from "react-textarea-autosize";
import React, { FC, useCallback, useMemo, useState } from "react";
import { useFlowLocale } from "../../FlowLocaleScope";
import { createUseFlowStyles } from "../JssTheming";
import { SYSTEM_FONT } from "../utils/system-font";
import { ToolButton } from "./ToolButton";

export interface ScriptEditorProps {
    value: string;
    onSave: (value: string) => void;
    onCancel: () => void;
}

export const ScriptEditor: FC<ScriptEditorProps> = ({value: defaultValue, onSave, onCancel}) => {
    const classes = useStyles();
    const locale = useFlowLocale();
    const [value, setValue] = useState(defaultValue);
    
    const error = useMemo(() => {
        try {
            new Function(`"use strict"; async () => ${value};`);
            return null;
        } catch (err) {
            return err instanceof Error ? err : new Error(String(err));
        }
    }, [value]);

    const isValid = useMemo(() => !error, [error]);

    const handleSave = useCallback(() => {
        if (isValid) {
            onSave(value);
        }
    }, [onSave, isValid, value]);
    
    const onChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value);
    }, [setValue]);

    const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Escape") {
            e.stopPropagation();
            e.preventDefault();
            onCancel();
        }
    }, [handleSave, onCancel]);

    return (
        <div className={classes.root}>
            <div className={classes.inputRow}>
                <TextareaAutosize
                    className={classes.input}
                    autoFocus
                    spellCheck={false}
                    placeholder={locale.enter_script}
                    value={value}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    maxRows={10}
                />
                <ToolButton disabled={!isValid} onClick={handleSave}>
                    <Icon path={mdiCheck}/>
                </ToolButton>
                <ToolButton onClick={onCancel}>
                    <Icon path={mdiClose}/>
                </ToolButton>
            </div>
            <div className={clsx(classes.hint, value && error && classes.invalid)}>
                {error ? error.message : null}
            </div>
        </div>
    );
};

const useStyles = createUseFlowStyles("ScriptEditor", ({palette}) => ({
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
        padding: 8,
        fontFamily: "monospace",
        whiteSpace: "pre",
        border: "none",
        borderRadius: 0,
        outline: "none",
        boxSizing: "border-box",
        marginRight: 2,
        resize: "none",
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