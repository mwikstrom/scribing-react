import React, { useMemo } from "react";
import { FC } from "react";
import { FlowSelection, TextRun, TextStyle } from "scribing";
import { ParagraphView } from "./ParagraphView";

/** @internal */
export interface EmptyFlowContentProps {
    selection: FlowSelection | boolean;
}

/** @internal */
export const EmptyFlowContent: FC<EmptyFlowContentProps> = ({selection}) => {
    const children = useMemo(() => Object.freeze([new TextRun({ text: "", style: TextStyle.empty })]), []);
    return (
        <ParagraphView
            children={children}
            selection={selection}
        />
    );
};
