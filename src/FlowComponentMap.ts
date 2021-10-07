import { 
    CSSProperties, 
    FC, 
    MouseEventHandler, 
    ReactNode, 
    RefCallback 
} from "react";
import { 
    LineBreak, 
    ParagraphBreak, 
    ParagraphStyleVariant, 
    TextRun, 
    FlowButton,
    DynamicText,
} from "scribing";
import { DynamicTextView } from "./DynamicTextView";
import { FlowButtonView } from "./FlowButtonView";
import { FlowNodeComponent } from "./FlowNodeComponent";
import { LineBreakView } from "./LineBreakView";
import { ParagraphBreakView } from "./ParagraphBreakView";
import { TextRunView } from "./TextRunView";
import { UnknownNodeView } from "./UnknownNodeView";

/** @public */
export const DefaultFlowComponentMap: Readonly<FlowComponentMap> = Object.freeze({
    h1: "h1",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    h5: "h5",
    h6: "h6",
    normal: "p",
    code: "p",
    title: "p",
    subtitle: "p",
    preamble: "p",
    textRunView: TextRunView,
    lineBreakView: LineBreakView,
    paragraphBreakView: ParagraphBreakView,
    link: "a",
    buttonView: FlowButtonView,
    button: "button",
    dynamicTextView: DynamicTextView,
    fallbackView: UnknownNodeView,
});

/** @public */
export interface FlowComponentMap extends Record<ParagraphStyleVariant, ParagraphComponent> {
    textRunView: FlowNodeComponent<TextRun>;
    lineBreakView: FlowNodeComponent<LineBreak>;
    paragraphBreakView: FlowNodeComponent<ParagraphBreak>;
    link: LinkComponent;
    button: ButtonComponent;
    buttonView: FlowNodeComponent<FlowButton>;
    dynamicTextView: FlowNodeComponent<DynamicText>;
    fallbackView: FlowNodeComponent;
}

/** @public */
export type ParagraphComponent = (
    "div" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" |
    FC<ParagraphComponentProps>
);

/** @public */
export interface ParagraphComponentProps {
    style: CSSProperties;
    className: string;
    children: ReactNode;
}

/** @public */
export type LinkComponent = "a" | FC<LinkComponentProps>;

/** @public */
export interface LinkComponentProps {
    className: string;
    children: ReactNode;
    href: string;
    title?: string; // TODO: REMOVE THIS
    onClick: MouseEventHandler;
    onMouseEnter: MouseEventHandler;
    onMouseLeave: MouseEventHandler;
}

/** @public */
export type ButtonComponent = "button" | FC<ButtonComponentProps>;

/** @public */
export interface ButtonComponentProps {
    className: string;
    children: ReactNode;
    ref: RefCallback<HTMLElement>;
    onClick: MouseEventHandler;
    onMouseEnter: MouseEventHandler;
    onMouseLeave: MouseEventHandler;
}
