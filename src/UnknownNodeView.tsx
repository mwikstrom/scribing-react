import React from "react";
import { FlowNodeComponent } from "./FlowNodeComponent";

export const UnknownNodeView: FlowNodeComponent = props => {
    const { ref } = props;
    return (
        <span
            ref={ref}
            className="scribing-unknown-object"
            children="\uFFFC"
        />
    );
};
