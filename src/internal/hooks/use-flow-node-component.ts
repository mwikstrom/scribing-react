import { useMemo } from "react";
import {
    DynamicText, 
    EmptyMarkup, 
    EndMarkup, 
    FlowBox, 
    FlowIcon, 
    FlowImage, 
    FlowNode, 
    FlowTable, 
    FlowVideo, 
    LineBreak, 
    ParagraphBreak, 
    StartMarkup, 
    TextRun 
} from "scribing";
import { useFlowComponentMap } from "../FlowComponentMapScope";
import { FlowNodeComponent } from "../FlowNodeComponent";

/** @internal */
export const useFlowNodeComponent = (
    node: FlowNode,
): FlowNodeComponent => {
    const components = useFlowComponentMap();
    return useMemo(() => {
        const key = getFlowNodeComponentKey(node);
        return components[key] as FlowNodeComponent;
    }, [node, components]);
};

type FlowNodeComponentKey = (
    "textRunView" | 
    "lineBreakView" | 
    "paragraphBreakView" | 
    "boxView" | 
    "dynamicTextView" |
    "fallbackView" |
    "iconView" |
    "imageView" |
    "videoView" |
    "tableView" |
    "startMarkupView" |
    "emptyMarkupView" |
    "endMarkupView"
);

const getFlowNodeComponentKey = (node: FlowNode): FlowNodeComponentKey => {
    if (node instanceof TextRun) {
        return "textRunView";
    } else if (node instanceof LineBreak) {
        return "lineBreakView";
    } else if (node instanceof ParagraphBreak) {
        return "paragraphBreakView";
    } else if (node instanceof FlowBox) {
        return "boxView";
    } else if (node instanceof DynamicText) {
        return "dynamicTextView";
    } else if (node instanceof FlowIcon) {
        return "iconView";
    } else if (node instanceof FlowImage) {
        return "imageView";
    } else if (node instanceof FlowVideo) {
        return "videoView";
    } else if (node instanceof FlowTable) {
        return "tableView";
    } else if (node instanceof StartMarkup) {
        return "startMarkupView";
    } else if (node instanceof EmptyMarkup) {
        return "emptyMarkupView";
    } else if (node instanceof EndMarkup) {
        return "endMarkupView";
    } else {
        return "fallbackView";
    }
};
