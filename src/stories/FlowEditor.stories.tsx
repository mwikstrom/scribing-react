import React, { useCallback, useState } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { FlowEditor } from "../FlowEditor";
import { FlowEditorProps } from "..";
import { FlowContent, TextRun, TextStyle, ParagraphBreak, LineBreak } from "scribing";

export default {
    title: "FlowEditor",
    component: FlowEditor,
} as ComponentMeta<typeof FlowEditor>;
  
const Template: ComponentStory<typeof FlowEditor> = args => <FlowEditor {...args} />;

export const Uncontrolled = Template.bind({});
Uncontrolled.args = {};

export const WithSelectionPrintOut: ComponentStory<typeof FlowEditor> = args => {
    const [printOut, setPrintOut] = useState("");
    const onChange = useCallback<Exclude<FlowEditorProps["onChange"], undefined>>((_, newSelection) => {
        setPrintOut(newSelection.map(range => `${range.anchor} -> ${range.focus}`).join("; "));
        return true;
    }, [setPrintOut]);
    return (
        <>
            <div>Selection: {printOut}</div>
            <FlowEditor {...args} onChange={onChange}/>
        </>
    );
};
WithSelectionPrintOut.args = {
    defaultContent: new FlowContent({
        nodes: Object.freeze([
            TextRun.fromData("Hello"),
            new LineBreak(),
            TextRun.fromData({ text: "there", style: new TextStyle({ italic: true }) }),
            new ParagraphBreak(),
            TextRun.fromData("world"),
            new ParagraphBreak(),
        ])
    })
};
