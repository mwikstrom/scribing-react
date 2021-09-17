import { useMemo } from "react";
import { FlowNode, LineBreak, ParagraphBreak, TextRun } from "scribing";
import { FlowNodeComponent, FlowNodeComponentMap } from "../../FlowNodeComponent";
import { DefaultFlowNodeComponents } from "../DefaultFlowNodeComponents";

/** @internal */
export const useFlowNodeComponent = (
    node: FlowNode,
    components: Partial<Readonly<FlowNodeComponentMap>>,
): FlowNodeComponent => useMemo(() => {
    const key = getFlowNodeComponentKey(node);
    let mapped = components[key] as FlowNodeComponent | undefined;
    if (!mapped) {
        mapped = DefaultFlowNodeComponents[key] as FlowNodeComponent;
    }
    return mapped;
}, [node, components]);

const getFlowNodeComponentKey = (node: FlowNode): Exclude<keyof FlowNodeComponentMap, "paragraph"> => {
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
