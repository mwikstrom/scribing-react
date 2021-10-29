import React, { FC } from "react";
import { FlowNode, FlowRangeSelection, FlowSelection, TextRun } from "scribing";
import { FlowCaret } from "./FlowCaret";
import { FlowNodeComponentProps } from "./FlowNodeComponent";
import { useFlowNodeComponent } from "./hooks/use-flow-node-component";
import { setupFlowNodeMapping } from "./mapping/flow-node";

export const FlowNodeView: FC<Omit<FlowNodeComponentProps, "ref">> = props => {
    const { node, selection } = props;
    const Component = useFlowNodeComponent(node);
    const caret = getCaretPlacement(node, selection);
    const ref = (dom: HTMLElement | null) => {
        if (dom) {
            setupFlowNodeMapping(dom, node);
        }
    };
    return (
        <>
            {caret === "before" && <FlowCaret/> }
            <Component ref={ref} {...props}/>
            {caret === "after" && <FlowCaret/> }
        </>
    );
};

const getCaretPlacement = (node: FlowNode, selection: FlowSelection | boolean): "none" | "before" | "after" => {
    if (selection instanceof FlowRangeSelection && !(node instanceof TextRun)) {
        const { range } = selection;
        if (range.isCollapsed) {
            const caretPos = range.first;
            if (caretPos === 0) {
                return "before";
            } else if (caretPos === node.size) {
                return "after";
            }
        }
    }
    return "none";
};
