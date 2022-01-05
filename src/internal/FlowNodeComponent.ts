import { 
    FC, 
    forwardRef, 
    ForwardRefRenderFunction, 
    ReactElement, 
    RefCallback 
} from "react";
import { FlowCursor, FlowNode, FlowSelection } from "scribing";

export type FlowNodeComponent<T extends FlowNode = FlowNode> = FC<FlowNodeComponentProps<T>>;

export type OpposingTag = FlowCursor | null;

export interface FlowNodeComponentProps<T extends FlowNode = FlowNode> {
    node: T;
    opposingTag: OpposingTag;
    ref: RefCallback<HTMLElement>;
    singleNodeInPara?: boolean;
    selection: boolean | FlowSelection;
}

export const flowNode = <T extends FlowNode>(
    render: (props: Omit<FlowNodeComponentProps<T>, "ref">, ref: RefCallback<HTMLElement>) => (ReactElement | null),
): FlowNodeComponent<T> => forwardRef(
    render as ForwardRefRenderFunction<HTMLElement, Omit<FlowNodeComponentProps<T>, "ref">>
) as FlowNodeComponent<T>;
