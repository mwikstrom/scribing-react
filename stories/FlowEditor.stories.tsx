import React, { useCallback, useState } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { FlowEditor } from "../src/FlowEditor";
import { FlowEditorProps } from "../src";
import { 
    FlowContent,
    FlowRangeSelection,
    FlowEditorState
} from "scribing";

export default {
    title: "FlowEditor",
    component: FlowEditor,
} as ComponentMeta<typeof FlowEditor>;
  
const Template: ComponentStory<typeof FlowEditor> = args => {
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

export const Empty = Template.bind({});
Empty.args = {};

export const TextOnly = Template.bind({});
TextOnly.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "Hello world!"
    ])),
};

export const TwoParas = Template.bind({});
TwoParas.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "Hello",
        { break: "line" },
        { text: "there", style: { italic: true } },
        { break: "para" },
        "world",
        { break: "para" },
    ])),
};

export const TrailingPara = Template.bind({});
TrailingPara.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "Hello",
        { break: "line" },
        { text: "there", style: { italic: true } },
        { break: "para" },
        "world",
    ])),
};

const getPrintOut = (state: FlowEditorState): string => {
    const { selection } = state;

    if (selection === null) {
        return "(none)";
    }

    if (selection instanceof FlowRangeSelection) {        
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
