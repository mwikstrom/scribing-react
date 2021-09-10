import React, { FC, useMemo, useRef } from "react";
import { TextRun } from "scribing";
import { useNodeMapping } from "./dom-mapping";
import { getTextCssProperties } from "./text-css";

/** @internal */
export interface TextRunViewProps {
    node: TextRun;
}

export const TextRunView: FC<TextRunViewProps> = props => {
    const { node } = props;
    const { text, style } = node;
    const css = useMemo(() => getTextCssProperties(style), [style]);
    const rootRef = useRef<HTMLSpanElement | null>(null);
    useNodeMapping(rootRef, node);
    return (
        <span
            ref={rootRef}
            style={css}
            className="scribing-text-run"
            children={text}
        />
    );
};
