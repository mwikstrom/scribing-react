import React, { FC, useCallback } from "react";
import { OpenUrl } from "scribing";
import { useFlowLocale } from "../FlowLocaleScope";
import { InputEditor } from "./InputEditor";

export interface OpenUrlEditorProps {
    value: string;
    onSave: (value: string) => void;
    onCancel: () => void;
    editingHost: HTMLElement | null;
}

export const OpenUrlEditor: FC<OpenUrlEditorProps> = props => {
    const locale = useFlowLocale();
    const getError = useCallback((value: string) => {
        try {
            new OpenUrl({url: value});
            return null;
        } catch {
            return locale.must_be_a_valid_web_page_url;
        }
    }, [locale]);
    return (
        <InputEditor
            {...props}
            placeholder={locale.enter_web_page_url}
            onGetError={getError}
        />
    );
};
