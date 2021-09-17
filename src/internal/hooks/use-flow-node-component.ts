import { useMemo } from "react";
import { FlowNode, LineBreak, ParagraphBreak, TextRun } from "scribing";
import { FlowNodeComponent, FlowNodeComponentMap } from "../../FlowNodeComponent";
import { LineBreakView } from "../../LineBreakView";
import { ParagraphBreakView } from "../../ParagraphBreakView";
import { TextRunView } from "../../TextRunView";
import { UnknownNodeView } from "../../UnknownNodeView";

/** @internal */
export const useFlowNodeComponent = (
    node: FlowNode,
    map: Partial<Readonly<FlowNodeComponentMap>>,
): FlowNodeComponent => useMemo(() => {
    const key = getFlowNodeComponentKey(node);
    let mapped = map[key] as FlowNodeComponent | undefined;
    if (!mapped) {
        mapped = defaultMap[key] as FlowNodeComponent;
    }
    return mapped;
}, [node, map]);

const getFlowNodeComponentKey = (node: FlowNode): keyof FlowNodeComponentMap => {
    if (node instanceof TextRun) {
        return "textRun";
    } else if (node instanceof LineBreak) {
        return "lineBreak";
    } else if (node instanceof ParagraphBreak) {
        return "paragraphBreak";
    } else {
        return "fallback";
    }
};

const defaultMap: Readonly<FlowNodeComponentMap> = Object.freeze({
    textRun: TextRunView,
    lineBreak: LineBreakView,
    paragraphBreak: ParagraphBreakView,
    fallback: UnknownNodeView,
});
