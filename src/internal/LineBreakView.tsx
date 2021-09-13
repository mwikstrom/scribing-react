import React, { FC, useRef } from "react";
import { LineBreak } from "scribing";
import { useNodeMapping } from "./dom-mapping";

/** @internal */
export interface LineBreakViewProps {
    node: LineBreak;
}

export const LineBreakView: FC<LineBreakViewProps> = props => {
    const { node } = props;
    const rootRef = useRef<HTMLSpanElement | null>(null);
    useNodeMapping(rootRef, node);
    return (
        <span
            ref={rootRef}
            className="scribing-line-break"
            contentEditable={false}
            children={<>↵<br/></>}
        />
    );
};
