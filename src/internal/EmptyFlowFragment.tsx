import React, { useMemo } from "react";
import { FC } from "react";
import { FlowSelection, TextRun, TextStyle } from "scribing";
import { FlowNodeView } from "./FlowNodeView";

/** @internal */
export interface EmptyFlowFragmentProps {
    selection: FlowSelection | boolean;
}

/** @internal */
export const EmptyFlowFragment: FC<EmptyFlowFragmentProps> = ({selection}) => {
    const emptyTextRun = useMemo(() => new TextRun({ text: "", style: TextStyle.empty }), []);
    return (
        <FlowNodeView
            node={emptyTextRun}
            selection={selection}
        />
    );
};
