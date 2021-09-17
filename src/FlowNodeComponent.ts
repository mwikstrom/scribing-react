import { CSSProperties, FC, forwardRef, ForwardRefRenderFunction, ReactNode, Ref } from "react";
import { FlowNode, FlowTheme, LineBreak, ParagraphBreak, ParagraphStyleVariant, TextRun } from "scribing";

export type FlowNodeComponent<T extends FlowNode = FlowNode> = FC<FlowNodeComponentProps<T>>;

export interface FlowNodeComponentProps<T extends FlowNode = FlowNode> {
    node: T;
    ref: Ref<HTMLElement>;
    theme: FlowTheme;
    components: Partial<Readonly<FlowNodeComponentMap>>;
}

export interface FlowNodeComponentMap {
    text: FlowNodeComponent<TextRun>;
    lineBreak: FlowNodeComponent<LineBreak>;
    paragraphBreak: FlowNodeComponent<ParagraphBreak>;
    paragraph: (variant: ParagraphStyleVariant) => ParagraphComponent;
    fallback: FlowNodeComponent;
}

export type ParagraphComponent = (
    "div" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" |
    FC<ParagraphComponentProps>
);

export interface ParagraphComponentProps {
    style: CSSProperties;
    className: string;
    children: ReactNode;
}

export const flowNode = <T extends FlowNode>(
    render: ForwardRefRenderFunction<HTMLElement, Omit<FlowNodeComponentProps<T>, "ref">>
): FlowNodeComponent<T> => forwardRef(render);
