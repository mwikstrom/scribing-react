import React, { FC, useRef } from "react";
import { ParagraphBreak } from "scribing";
import { useNodeMapping } from "./dom-mapping";

/** @internal */
export interface ParagraphBreakViewProps {
    node: ParagraphBreak;
}

export const ParagraphBreakView: FC<ParagraphBreakViewProps> = props => {
    const { node } = props;
    const rootRef = useRef<HTMLSpanElement | null>(null);
    useNodeMapping(rootRef, node);
    return (
        <span
            ref={rootRef}
            className="scribing-para-break"
            contentEditable={false}
            children="¶"
        />
    );
};
