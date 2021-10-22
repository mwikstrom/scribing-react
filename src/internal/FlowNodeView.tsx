import React, { FC } from "react";
import { FlowNodeComponentProps } from "./FlowNodeComponent";
import { useFlowNodeComponent } from "./hooks/use-flow-node-component";
import { setupFlowNodeMapping } from "./mapping/flow-node";

export const FlowNodeView: FC<Omit<FlowNodeComponentProps, "ref">> = props => {
    const { node } = props;
    const Component = useFlowNodeComponent(node);
    const ref = (dom: HTMLElement | null) => {
        if (dom) {
            setupFlowNodeMapping(dom, node);
        }
    };
    return <Component ref={ref} {...props}/>;
};
