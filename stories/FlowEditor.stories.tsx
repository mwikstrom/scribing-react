import React, { CSSProperties, useCallback, useEffect, useMemo, useState } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { FlowEditor } from "../src/FlowEditor";
import { FlowEditorProps } from "../src";
import { FlowContent, FlowEditorState, FlowSelection } from "scribing";

export default {
    title: "FlowEditor",
    component: FlowEditor,
} as ComponentMeta<typeof FlowEditor>;
  
const Template: ComponentStory<typeof FlowEditor> = args => {
    const [state, setState] = useState(args.defaultState ?? FlowEditorState.empty);
    const [jsonState, setJsonState] = useState("");
    useEffect(() => {
        const timerId = setTimeout(
            () => setJsonState(JSON.stringify(FlowEditorState.dataType.toJsonValue(state.toData()), undefined, " ")),
            250
        );
        return () => clearTimeout(timerId);
    }, [state]);
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

export const TextOnlyWithInitialSelection = Template.bind({});
TextOnlyWithInitialSelection.args = {
    defaultState: FlowEditorState.empty.merge({
        content: FlowContent.fromJsonValue([
            "Hello world!"
        ]),
        selection: FlowSelection.fromJsonValue({
            range: [6, 11]
        }),
    }),
};

export const TextOnlyWithInitialSelectionAndAutoFocus = Template.bind({});
TextOnlyWithInitialSelectionAndAutoFocus.args = {
    autoFocus: true,
    defaultState: FlowEditorState.empty.merge({
        content: FlowContent.fromJsonValue([
            "Hello world!"
        ]),
        selection: FlowSelection.fromJsonValue({
            range: [6, 11]
        }),
    }),
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

export const Button = Template.bind({});
Button.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "Let's try a button:",
        { break: "para" },
        { button: [
            "Hello ",
            { text: "world", style: { italic: true } },
            "!",
        ]},        
        { break: "para" },
        "The end.",
        { break: "para" },
    ])),
};

export const InlineButton = Template.bind({});
InlineButton.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "Let's try an inline button: ",
        { button: [
            "Hello ",
            { text: "world", style: { italic: true } },
            "!",
        ]},        
        " The end.",
        { break: "para" },
    ])),
};

export const NestedButton = Template.bind({});
NestedButton.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "Can a ",
        { button: [
            "button be ",
            { button: [
                "nested inside"
            ]},
            " another",
        ]},        
        " button?",
        { break: "para" },
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
        "Disc bullet 1",
        { break: "para", style: { listLevel: 1 } },
        "Disc bullet 2",
        { break: "para", style: { listLevel: 1 } },        
        "Dash bullet",
        { break: "para", style: { listLevel: 1, listMarker: "dash" } },        
        "Disc bullet 3",
        { break: "para", style: { listLevel: 2, variant: "h3" } },        
        "Disc bullet 4",
        { break: "para", style: { listLevel: 3 } },        
        "Numeric bullet 5",
        { break: "para", style: { listLevel: 3, listMarker: "ordered" } },
        "Inside numeric bullet 5",
        { break: "para", style: { listLevel: 3, listMarker: "ordered", hideListMarker: true } },
        "Numeric bullet 5b",
        { break: "para", style: { listLevel: 3, listMarker: "ordered" } },
        "Numeric bullet 5c",
        { break: "para", style: { listLevel: 3, listMarker: "ordered" } },
        "Numeric bullet RESET",
        { break: "para", style: { listLevel: 3, listMarker: "ordered", listCounter: 23 } },
        "Numeric bullet 5d",
        { break: "para", style: { listLevel: 3, listMarker: "ordered" } },
        "Numeric bullet 6",
        { break: "para", style: { listLevel: 4, listMarker: "ordered", variant: "code" } },
        "Numeric bullet 7",
        { break: "para", style: { listLevel: 5, listMarker: "ordered", variant: "h2" } },
        "Numeric bullet 8",
        { break: "para", style: { listLevel: 3, listMarker: "ordered" } },
        "Numeric bullet 9",
        { break: "para", style: { listLevel: 4, listMarker: "ordered" } },
        "Some code",
        { break: "para", style: { variant: "code" } },
        "Disc bullet 1",
        { break: "para", style: { listLevel: 1, listMarker: "ordered", listCounter: "resume" } },
        "Some code",
        { break: "para", style: { variant: "code" } },
        "Disc bullet 1",
        { break: "para", style: { listLevel: 1, listMarker: "ordered" } },
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

export const Counter = Template.bind({});
Counter.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "Counter value is: ",
        { dynamic: "value || 0" },
        ". ",
        { button: ["Increment"], action: { script: "value = (value || 0) + 1" } },
        { break: "para" },
    ])),
};

export const DynamicTextStates = Template.bind({});
DynamicTextStates.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "This should be an error: ", { dynamic: "bad.stuff()" },
        { break: "para" },
        "This should be \"OK\": ", { dynamic: "'OK'" },
        { break: "para" },
        "This should fail after 1 second: ", { dynamic: "{ await delay(1000); throw new Error('Failure'); }" },
        { break: "para" },
        "This should resolve to \"OK\" after 1 second: ", { dynamic: "{ await delay(1000); return 'OK' }" },
        { break: "para" },
        "This should be null: ", { dynamic: "null" },
        { break: "para" },
        "This should be empty: ", { dynamic: "''" },
        { break: "para" },
        "This is an empty expression: ", { dynamic: "" },
    ])),
};

export const ButtonStates = Template.bind({});
ButtonStates.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "This button should fail immediately: ",
        { button: ["Click me"], action: { script: "{ throw new Error('Failed'); }" } },
        { break: "para" },
        "This button should fail after 1 second: ",
        { button: ["Click me"], action: { script: "{ await delay(1000); throw new Error('Failed'); }" } },
        { break: "para" },
        "This button should succeed after 1 second: ",
        { button: ["Click me"], action: { script: "delay(1000)" } },
        { break: "para" },
    ])),
};


export const LinkStates = Template.bind({});
LinkStates.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "This link should fail immediately: ",
        { text: "Click me", style: { link: { script: "{ throw new Error('Failed'); }" } } },
        { break: "para" },
        "This link should fail after 1 second: ",
        { text: "Click me", style: { link: { script: "{ await delay(1000); throw new Error('Failed'); }" } } },
        { break: "para" },
        "This link should succeed after 1 second: ",
        { text: "Click me", style: { link: { script: "delay(1000)" } } },
        { break: "para" },
    ])),
};
