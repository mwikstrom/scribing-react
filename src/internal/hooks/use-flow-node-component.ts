import { useMemo } from "react";
import { FlowNode, LineBreak, ParagraphBreak, TextRun } from "scribing";
import { FlowNodeComponent, FlowNodeComponentMap } from "../../FlowNodeComponent";

/** @internal */
export const useFlowNodeComponent = (
    node: FlowNode,
    components: Readonly<FlowNodeComponentMap>,
): FlowNodeComponent => useMemo(() => {
    const key = getFlowNodeComponentKey(node);
    return components[key] as FlowNodeComponent;
}, [node, components]);

type FlowNodeComponentKey = "text" | "lineBreak" | "paragraphBreak" | "fallback";

const getFlowNodeComponentKey = (node: FlowNode): FlowNodeComponentKey => {
    if (node instanceof TextRun) {
        return "text";
    } else if (node instanceof LineBreak) {
        return "lineBreak";
    } else if (node instanceof ParagraphBreak) {
        return "paragraphBreak";
    } else {
        return "fallback";
    }
};
