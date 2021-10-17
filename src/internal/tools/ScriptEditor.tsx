import React, { FC } from "react";

export interface ScriptEditorProps {
    value: string;
    onSave: (value: string) => void;
    onCancel: () => void;
}

export const ScriptEditor: FC<ScriptEditorProps> = ({value, onSave}) => {
    return (<div>TODO: {value}</div>);
};
