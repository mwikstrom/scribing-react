import { 
    FC, 
    forwardRef, 
    ForwardRefRenderFunction, 
    ReactElement, 
    RefCallback 
} from "react";
import { FlowNode } from "scribing";

export type FlowNodeComponent<T extends FlowNode = FlowNode> = FC<FlowNodeComponentProps<T>>;

export interface FlowNodeComponentProps<T extends FlowNode = FlowNode> {
    node: T;
    ref: RefCallback<HTMLElement>;
    position: number;
}

export const flowNode = <T extends FlowNode>(
    render: (props: Omit<FlowNodeComponentProps<T>, "ref">, ref: RefCallback<HTMLElement>) => (ReactElement | null),
): FlowNodeComponent<T> => forwardRef(
    render as ForwardRefRenderFunction<HTMLElement, Omit<FlowNodeComponentProps<T>, "ref">>
) as FlowNodeComponent<T>;
