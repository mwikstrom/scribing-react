import { ParagraphStyleVariant } from "scribing";
import { FlowButtonView } from "./FlowButtonView";
import { FlowNodeComponentMap, ParagraphComponent } from "./FlowNodeComponent";
import { LineBreakView } from "./LineBreakView";
import { ParagraphBreakView } from "./ParagraphBreakView";
import { TextRunView } from "./TextRunView";
import { UnknownNodeView } from "./UnknownNodeView";

const getParagraphComponent = (variant: ParagraphStyleVariant): ParagraphComponent => {
    switch (variant) {
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
        return variant;
    
    default:
        return "p";
    }
};

/** @public */
export const DefaultFlowNodeComponents: Readonly<FlowNodeComponentMap> = Object.freeze({
    textRunView: TextRunView,
    lineBreakView: LineBreakView,
    paragraphBreakView: ParagraphBreakView,
    paragraph: getParagraphComponent,
    link: "a",
    buttonView: FlowButtonView,
    button: "button",
    fallbackView: UnknownNodeView,
});
