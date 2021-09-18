import React, { useCallback, useState } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { FlowEditor } from "../src/FlowEditor";
import { FlowEditorProps } from "../src";
import { FlowContent, TextRun, TextStyle, ParagraphBreak, LineBreak, RangeSelection, FlowEditorState } from "scribing";

export default {
    title: "FlowEditor",
    component: FlowEditor,
} as ComponentMeta<typeof FlowEditor>;
  
const Template: ComponentStory<typeof FlowEditor> = args => <FlowEditor {...args} />;

export const Uncontrolled = Template.bind({});
Uncontrolled.args = {};

export const WithSelectionPrintOut: ComponentStory<typeof FlowEditor> = args => {
    const [printOut, setPrintOut] = useState("");
    const onStateChange = useCallback<Exclude<FlowEditorProps["onStateChange"], undefined>>(state => {
        setPrintOut(getPrintOut(state));
        return true;
    }, [setPrintOut]);
    return (
        <>
            <div>Selection: {printOut}</div>
            <FlowEditor {...args} onStateChange={onStateChange}/>
        </>
    );
};
WithSelectionPrintOut.args = {
    defaultState: FlowEditorState.empty.set("content", new FlowContent({
        nodes: Object.freeze([
            TextRun.fromData("Hello"),
            new LineBreak(),
            TextRun.fromData({ text: "there", style: new TextStyle({ italic: true }) }),
            new ParagraphBreak(),
            TextRun.fromData("world"),
            new ParagraphBreak(),
        ])
    }))
};

const getPrintOut = (state: FlowEditorState): string => {
    const { selection } = state;

    if (selection === null) {
        return "(none)";
    }

    if (selection instanceof RangeSelection) {        
        const { range: { isCollapsed, anchor, focus } } = selection;
        
        if (isCollapsed) {
            return String(anchor);
        } else if (anchor > focus) {
            return `${focus} ← ${anchor}`;
        } else {
            return `${anchor} → ${focus}`;
        }
    }

    return "?";
};
