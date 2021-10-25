import { mdiCheck, mdiClose } from "@mdi/js";
import Icon from "@mdi/react";
import clsx from "clsx";
import React, { FC, useCallback, useMemo, useState } from "react";
import { OpenUrl } from "scribing";
import { useFlowLocale } from "../FlowLocaleScope";
import { createUseFlowStyles } from "../JssTheming";
import { SYSTEM_FONT } from "../utils/system-font";
import { ToolButton } from "./ToolButton";

export interface OpenUrlEditorProps {
    value: string;
    onSave: (value: string) => void;
    onCancel: () => void;
    editingHost: HTMLElement | null;
}

export const OpenUrlEditor: FC<OpenUrlEditorProps> = ({value: defaultValue, onSave, onCancel, editingHost}) => {
    const classes = useStyles();
    const locale = useFlowLocale();
    const [value, setValue] = useState(defaultValue);
    
    const isValid = useMemo(() => {
        try {
            new OpenUrl({url: value});
            return true;
        } catch {
            return false;
        }
    }, [value]);

    const handleSave = useCallback(() => {
        if (isValid) {
            onSave(value);
        }
    }, [onSave, isValid, value]);
    
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
                    placeholder={locale.enter_web_page_url}
                    value={value}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                />
                <ToolButton disabled={!isValid} onClick={handleSave} editingHost={editingHost}>
                    <Icon path={mdiCheck}/>
                </ToolButton>
                <ToolButton onClick={onCancel} editingHost={editingHost}>
                    <Icon path={mdiClose}/>
                </ToolButton>
            </div>
            <div className={clsx(classes.hint, !isValid && value && classes.invalid)}>
                {locale.must_be_a_valid_web_page_url}
            </div>
        </div>
    );
};

const useStyles = createUseFlowStyles("OpenUrlEditor", ({palette}) => ({
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