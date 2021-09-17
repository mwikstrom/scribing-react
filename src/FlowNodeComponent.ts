import { FC, forwardRef, ForwardRefRenderFunction, Ref } from "react";
import { FlowNode, FlowTheme, LineBreak, ParagraphBreak, TextRun } from "scribing";

export type FlowNodeComponent<T extends FlowNode = FlowNode> = FC<FlowNodeComponentProps<T>>;

export interface FlowNodeComponentProps<T extends FlowNode = FlowNode> {
    node: T;
    ref: Ref<HTMLElement>;
    theme: FlowTheme;
    map: Partial<Readonly<FlowNodeComponentMap>>;
}

export interface FlowNodeComponentMap {
    textRun: FlowNodeComponent<TextRun>;
    lineBreak: FlowNodeComponent<LineBreak>;
    paragraphBreak: FlowNodeComponent<ParagraphBreak>;
    fallback: FlowNodeComponent;
}

export const flowNode = <T extends FlowNode>(
    render: ForwardRefRenderFunction<HTMLElement, Omit<FlowNodeComponentProps<T>, "ref">>
): FlowNodeComponent<T> => forwardRef(render);
