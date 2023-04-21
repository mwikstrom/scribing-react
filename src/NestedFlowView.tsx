import React from "react";
import { FlowContentView } from "./internal/FlowContentView";
import { FlowContent } from "scribing";

/** @public */
export interface NestedFlowViewProps {
    children?: FlowContent | null;
}

/** @public */
export const NestedFlowView = (props: NestedFlowViewProps): JSX.Element | null => {
    const { children } = props;
    if (children) {
        return <FlowContentView content={children} />;
    } else {
        return null;
    }
};
