import React from "react";
import { FC } from "react";
import { FlowRangeSelection, FlowSelection } from "scribing";
import { FlowCaret } from "./FlowCaret";

/** @internal */
export interface EmptyFlowFragmentProps {
    selection: FlowSelection | boolean;
}

/** @internal */
export const EmptyFlowFragment: FC<EmptyFlowFragmentProps> = ({selection}) => (
    <>
        {"\u200b"}
        {
            selection instanceof FlowRangeSelection &&
            selection.isCollapsed &&
            selection.range.first === 0 && 
            <FlowCaret/>
        }
    </>
);