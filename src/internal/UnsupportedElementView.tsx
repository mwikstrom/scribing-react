import React, { FC, useRef } from "react";
import { FlowNode } from "scribing";
import { useNodeMapping } from "./dom-mapping";

/** @internal */
export interface UnsupportedElementViewProps {
    node: FlowNode;
}

export const UnsupportedElementView: FC<UnsupportedElementViewProps> = props => {
    const { node } = props;
    const rootRef = useRef<HTMLSpanElement | null>(null);
    useNodeMapping(rootRef, node);
    return (
        <span
            ref={rootRef}
            className="scribing-unknown-object"
            children="\uFFFC"
        />
    );
};
