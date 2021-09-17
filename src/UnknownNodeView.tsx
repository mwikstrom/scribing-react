import React from "react";
import { flowNode } from "./FlowNodeComponent";

export const UnknownNodeView = flowNode((_, ref) => {
    return (
        <span
            ref={ref}
            className="scribing-unknown-object"
            children="\uFFFC"
        />
    );
});
