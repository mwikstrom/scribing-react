import React, { FC } from "react";
import { FlowNodeComponentProps } from "./FlowNodeComponent";
import { useFlowNodeComponent } from "./internal/hooks/use-flow-node-component";
import { setupFlowNodeMapping } from "./internal/mapping/flow-node";

export const FlowNodeView: FC<Omit<FlowNodeComponentProps, "ref">> = props => {
    const { node, map } = props;
    const Component = useFlowNodeComponent(node, map);
    const ref = (dom: HTMLElement | null) => {
        if (dom) {
            setupFlowNodeMapping(dom, node);
        }
    };
    return <Component ref={ref} {...props}/>;
};
