import React, { CSSProperties, useCallback, useMemo, useState } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { FlowEditor } from "../src/FlowEditor";
import { FlowEditorProps } from "../src";
import { FlowContent, FlowEditorState } from "scribing";

export default {
    title: "FlowEditor",
    component: FlowEditor,
} as ComponentMeta<typeof FlowEditor>;
  
const Template: ComponentStory<typeof FlowEditor> = args => {
    const [state, setState] = useState(args.defaultState ?? FlowEditorState.empty);
    const jsonState = useMemo(
        () => JSON.stringify(FlowEditorState.dataType.toJsonValue(state.toData()), undefined, " "),
        [state]
    );
    const onStateChange = useCallback<Exclude<FlowEditorProps["onStateChange"], undefined>>(
        state => void(setState(state)),
        [setState]
    );
    const wrapperStyle = useMemo<CSSProperties>(() => ({
        display: "flex",
        flexDirection: "row",
        height: "calc(100vh - 2rem - 2px)",
        border: "1px solid #888",
    }), []);
    const editorStyle = useMemo<CSSProperties>(() => ({
        flex: 0.5,
        overflow: "auto",
    }), []);
    const jsonStyle = useMemo<CSSProperties>(() => ({
        flex: 0.5,
        overflow: "auto",
        borderLeft: "1px solid #888",
        padding: 10,
        margin: 0,
    }), []);
    return (
        <div style={wrapperStyle}>
            <FlowEditor {...args} style={editorStyle} onStateChange={onStateChange}/>
            <pre style={jsonStyle}>{jsonState}</pre>
        </div>
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

export const Rich = Template.bind({});
Rich.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "Title",
        { break: "para", style: { variant: "title" } },
        "Subtitle",
        { break: "para", style: { variant: "subtitle" } },
        "A preamble text",
        { break: "para", style: { variant: "preamble" } },
        "Normal text",
        { break: "para" },
        "Heading level 2",
        { break: "para", style: { variant: "h2" } },
        "Normal text ",
        { text: "with a link", style: { link: "https://google.com/" } },
        ".",
        { break: "para" },
        "Some code",
        { break: "para", style: { variant: "code" } },
        "Let's try colors: ",
        { text: "primary", style: { color: "primary" } }, 
        " ",
        { text: "secondary", style: { color: "secondary" } }, 
        " ",
        { text: "subtle", style: { color: "subtle" } }, 
        " ",
        { text: "warning", style: { color: "warning" } }, 
        " ",
        { text: "error", style: { color: "error" } }, 
        " ",
        { text: "information", style: { color: "information" } }, 
        " ",
        { text: "success", style: { color: "success" } }, 
        " ",
    ])),
};
