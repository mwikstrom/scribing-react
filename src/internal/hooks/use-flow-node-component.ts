import { useMemo } from "react";
import { FlowButton, FlowNode, LineBreak, ParagraphBreak, TextRun } from "scribing";
import { FlowNodeComponent, FlowNodeComponentMap } from "../../FlowNodeComponent";

/** @internal */
export const useFlowNodeComponent = (
    node: FlowNode,
    components: Readonly<FlowNodeComponentMap>,
): FlowNodeComponent => useMemo(() => {
    const key = getFlowNodeComponentKey(node);
    return components[key] as FlowNodeComponent;
}, [node, components]);

type FlowNodeComponentKey = "textRunView" | "lineBreakView" | "paragraphBreakView" | "buttonView" | "fallbackView";

const getFlowNodeComponentKey = (node: FlowNode): FlowNodeComponentKey => {
    if (node instanceof TextRun) {
        return "textRunView";
    } else if (node instanceof LineBreak) {
        return "lineBreakView";
    } else if (node instanceof ParagraphBreak) {
        return "paragraphBreakView";
    } else if (node instanceof FlowButton) {
        return "buttonView";
    } else {
        return "fallbackView";
    }
};
