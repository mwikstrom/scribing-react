import { 
    CSSProperties, 
    FC, 
    forwardRef, 
    ForwardRefRenderFunction, 
    MouseEventHandler, 
    ReactElement, 
    ReactNode, 
    RefCallback 
} from "react";
import { 
    FlowNode, 
    ParagraphTheme, 
    LineBreak, 
    ParagraphBreak, 
    ParagraphStyleVariant, 
    TextRun, 
    FlowButton,
    DynamicText,
    Interaction
} from "scribing";

export type FlowNodeComponent<T extends FlowNode = FlowNode> = FC<FlowNodeComponentProps<T>>;

export interface FlowNodeComponentProps<T extends FlowNode = FlowNode> {
    node: T;
    ref: RefCallback<HTMLElement>;
    theme: ParagraphTheme;
    components: Readonly<FlowNodeComponentMap>;
    localization: Readonly<FlowNodeLocalization>;
    editable: boolean;
    formattingSymbols: boolean;
    evaluate: (expression: string) => unknown;
    interact: (action: Interaction) => void | Promise<void>;
}

export interface FlowNodeComponentMap {
    textRunView: FlowNodeComponent<TextRun>;
    lineBreakView: FlowNodeComponent<LineBreak>;
    paragraphBreakView: FlowNodeComponent<ParagraphBreak>;
    paragraph: (variant: ParagraphStyleVariant) => ParagraphComponent;
    link: LinkComponent;
    button: ButtonComponent;
    buttonView: FlowNodeComponent<FlowButton>;
    dynamicTextView: FlowNodeComponent<DynamicText>;
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
    ref: RefCallback<HTMLElement>;
    onClick: MouseEventHandler;
    onMouseEnter: MouseEventHandler;
    onMouseLeave: MouseEventHandler;
}

export const flowNode = <T extends FlowNode>(
    render: (props: Omit<FlowNodeComponentProps<T>, "ref">, ref: RefCallback<HTMLElement>) => (ReactElement | null),
): FlowNodeComponent<T> => forwardRef(
    render as ForwardRefRenderFunction<HTMLElement, Omit<FlowNodeComponentProps<T>, "ref">>
) as FlowNodeComponent<T>;
