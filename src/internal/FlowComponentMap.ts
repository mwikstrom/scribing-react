import { 
    CSSProperties, 
    FC, 
    ReactNode, 
    RefCallback 
} from "react";
import { 
    LineBreak, 
    ParagraphBreak, 
    ParagraphVariant, 
    TextRun, 
    FlowBox,
    DynamicText,
    FlowIcon,
} from "scribing";
import { DynamicTextView } from "./DynamicTextView";
import { FlowBoxView } from "./FlowBoxView";
import { FlowIconView } from "./FlowIconView";
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
    normal: "div",
    code: "div",
    title: "div",
    subtitle: "div",
    preamble: "div",
    textRunView: TextRunView,
    lineBreakView: LineBreakView,
    paragraphBreakView: ParagraphBreakView,
    link: "a",
    boxView: FlowBoxView,
    box: "span",
    dynamicTextView: DynamicTextView,
    fallbackView: UnknownNodeView,
    iconView: FlowIconView,
});

/** @public */
export interface FlowComponentMap extends Record<ParagraphVariant, ParagraphComponent> {
    textRunView: FlowNodeComponent<TextRun>;
    lineBreakView: FlowNodeComponent<LineBreak>;
    paragraphBreakView: FlowNodeComponent<ParagraphBreak>;
    link: LinkComponent;
    box: BoxComponent;
    boxView: FlowNodeComponent<FlowBox>;
    dynamicTextView: FlowNodeComponent<DynamicText>;
    fallbackView: FlowNodeComponent;
    iconView: FlowNodeComponent<FlowIcon>;
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
}

/** @public */
export type BoxComponent = "span" | FC<BoxComponentProps>;

/** @public */
export interface BoxComponentProps {
    className: string;
    children: ReactNode;
    ref: RefCallback<HTMLElement>;
}
