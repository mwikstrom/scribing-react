import { CSSProperties, FC, forwardRef, ForwardRefRenderFunction, MouseEventHandler, ReactNode, Ref } from "react";
import { 
    FlowNode, 
    ParagraphTheme, 
    LineBreak, 
    ParagraphBreak, 
    ParagraphStyleVariant, 
    TextRun, 
    FlowButton
} from "scribing";

export type FlowNodeComponent<T extends FlowNode = FlowNode> = FC<FlowNodeComponentProps<T>>;

export interface FlowNodeComponentProps<T extends FlowNode = FlowNode> {
    node: T;
    ref: Ref<HTMLElement>;
    theme: ParagraphTheme;
    components: Readonly<FlowNodeComponentMap>;
    localization: Readonly<FlowNodeLocalization>;
    editable: boolean;
    formattingSymbols: boolean;
}

export interface FlowNodeComponentMap {
    textRunView: FlowNodeComponent<TextRun>;
    lineBreakView: FlowNodeComponent<LineBreak>;
    paragraphBreakView: FlowNodeComponent<ParagraphBreak>;
    paragraph: (variant: ParagraphStyleVariant) => ParagraphComponent;
    link: LinkComponent;
    button: ButtonComponent;
    buttonView: FlowNodeComponent<FlowButton>;
    fallbackView: FlowNodeComponent;
}

export interface FlowNodeLocalization {
    holdCtrlKeyToEnableLink: string;
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

export type LinkComponent = "a" | FC<LinkComponentProps>;

export interface LinkComponentProps {
    className: string;
    children: ReactNode;
    href: string;
    title?: string; // TODO: REMOVE THIS
    onClick: MouseEventHandler;
    onMouseEnter: MouseEventHandler;
    onMouseLeave: MouseEventHandler;
}

export type ButtonComponent = "button" | FC<ButtonComponentProps>;

export interface ButtonComponentProps {
    className: string;
    children: ReactNode;
    ref: Ref<HTMLElement>;
    onClick: MouseEventHandler;
    onMouseEnter: MouseEventHandler;
    onMouseLeave: MouseEventHandler;
}

export const flowNode = <T extends FlowNode>(
    render: ForwardRefRenderFunction<HTMLElement, Omit<FlowNodeComponentProps<T>, "ref">>
): FlowNodeComponent<T> => forwardRef(render);
