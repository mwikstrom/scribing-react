import { mdiCheck, mdiClose } from "@mdi/js";
import Icon from "@mdi/react";
import clsx from "clsx";
import TextareaAutosize from "react-textarea-autosize";
import React, { FC, useCallback, useLayoutEffect, useMemo, useState } from "react";
import { useFlowLocale } from "../../FlowLocaleScope";
import { createUseFlowStyles } from "../JssTheming";
import { ToolButton } from "./ToolButton";

export interface ScriptEditorProps {
    value?: string;
    onSave: (value: string) => void;
    onCancel: () => void;
}

export const ScriptEditor: FC<ScriptEditorProps> = ({value: defaultValue = "", onSave, onCancel}) => {
    const classes = useStyles();
    const locale = useFlowLocale();
    const [value, setValue] = useState(defaultValue);
    const [pendingCaret, setPendingCaret] = useState(-1);
    const [textArea, setTextArea] = useState<HTMLTextAreaElement | null>(null);
    
    const error = useMemo(() => {
        try {
            new Function(`"use strict"; async () => ${value};`);
            return null;
        } catch (err) {
            return err instanceof Error ? err : new Error(String(err));
        }
    }, [value]);

    const handleSave = useCallback(() => {
        onSave(value);
    }, [onSave, value]);
    
    const onChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value);
        setPendingCaret(-1);
    }, [setValue]);

    const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Escape") {
            e.stopPropagation();
            e.preventDefault();
            onCancel();
            return;
        }

        if (e.key === "Enter" && e.ctrlKey) {
            e.stopPropagation();
            e.preventDefault();
            handleSave();
            return;
        }

        if (e.key === "Tab") {
            const { currentTarget } = e;
            const { selectionStart, selectionEnd } = currentTarget;
            e.stopPropagation();
            e.preventDefault();
            if (selectionStart === selectionEnd && selectionStart >= 0 && selectionStart <= value.length) {
                const before = value.substr(0, selectionStart);
                const after = value.substr(selectionStart);
                if (!e.shiftKey && /(?:^|\n)\s*$/.test(before)) {
                    setValue(`${before}\t${after}`);
                    setPendingCaret(currentTarget.selectionStart + 1);
                } else if (e.shiftKey && /(?:^|\n)\s*\t\s*$/.test(before)) {
                    const lastTab = before.lastIndexOf("\t");
                    if (lastTab >= 0) {
                        setValue(`${before.substr(0, lastTab)}${before.substr(lastTab + 1)}${after}`);
                        setPendingCaret(currentTarget.selectionStart - 1);
                    }
                }
            }
            return;
        }
    }, [handleSave, onCancel, value]);

    useLayoutEffect(() => {
        if (pendingCaret >= 0 && textArea) {
            textArea.setSelectionRange(pendingCaret, pendingCaret);
            setPendingCaret(-1);
        }
    }, [pendingCaret, textArea]);

    return (
        <div className={classes.root}>
            <div className={classes.inputRow}>
                <TextareaAutosize
                    ref={setTextArea}
                    className={classes.input}
                    autoFocus
                    spellCheck={false}
                    placeholder={locale.enter_script}
                    value={value}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    maxRows={10}
                />
                <ToolButton onClick={handleSave}>
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
        tabSize: 4,
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