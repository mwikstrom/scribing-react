import React, { useCallback, useState } from "react";
import { Script } from "scribing";

export interface CustomTagEditorProps {
    attr: ReadonlyMap<string, string | Script>;
    setAttr: (key: string, value: string | Script | null) => boolean;
}

export const CustomTagEditor = (props: CustomTagEditorProps): JSX.Element => {
    const { attr, setAttr } = props;
    return (
        <div style={{ padding: 10 }}>
            {["foo", "bar"].map(key => (
                <CustomAttrEditor
                    key={key}
                    name={key}
                    value={attr.get(key) || null}
                    onChange={value => setAttr(key, value)}
                />
            ))}
            <button onClick={() => alert("hello world!")}>Say hello</button>
        </div>
    );
};

interface CustomAttrEditorProps {
    name: string;
    value: string | Script | null;
    onChange: (value: string | Script | null) => boolean;
}

const CustomAttrEditor = (props: CustomAttrEditorProps): JSX.Element => {
    const { name, value: initial, onChange: onCommitChange } = props;
    const initialValue = initial === null ? "" : typeof initial === "string" ? initial : initial.code;
    const [value, setValue] = useState(initialValue);
    const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    }, [setValue]);
    const onBlur = useCallback(() => {
        if (!onCommitChange(value)) {
            setValue(initialValue);
        }
    }, [value, onCommitChange, setValue, initialValue]);
    return (
        <div>
            <div>{name}:</div>
            <input
                value={value}
                onChange={onChange}
                onBlur={onBlur}
            />
        </div>
    );
};
