import React from "react";
import { flowNode } from "./FlowNodeComponent";
import { MarkupReplacement } from "./MarkupReplacement";

export const MarkupReplacementView = flowNode<MarkupReplacement>((props, ref) => {
    const { node: { rendition } } = props;
    return <div ref={ref}>{rendition}</div>;
});
