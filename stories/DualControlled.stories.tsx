import React, { CSSProperties, useEffect, useMemo, useState } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { FlowEditor } from "../src/FlowEditor";
import { FlowEditorState } from "../src";
import { FlowContent, FlowOperation, ParagraphBreak } from "scribing";

export default {
    title: "DualControlled",
    component: FlowEditor,
} as ComponentMeta<typeof FlowEditor>;
 
const Template: ComponentStory<typeof FlowEditor> = args => {
    const [stateA, setStateA] = useState(initialState);
    const [stateB, setStateB] = useState(initialState);

    const wrapperStyle = useMemo<CSSProperties>(() => ({
        display: "flex",
        flexDirection: "row",
        height: "calc(100vh - 2rem - 2px)",
        border: "1px solid #888",
    }), []);

    const editorAStyle = useMemo<CSSProperties>(() => ({
        flex: 0.5,
        overflow: "auto",
    }), []);

    const editorBStyle = useMemo<CSSProperties>(() => ({
        flex: 0.5,
        overflow: "auto",
        borderLeft: "1px solid #888",
    }), []);

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            const char = String.fromCharCode(90 - (i % 26));
            const op = FlowOperation.fromJsonValue({insert: [char], at: 0});
            const setState = i++ % 2 === 0 ? setStateA : setStateB;
            setState(before => before.applyTheirs(op));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={wrapperStyle}>
            <FlowEditor 
                {...args}
                style={editorAStyle}
                state={stateA}
                onStateChange={e => setStateA(e.after)}
            />
            <FlowEditor 
                {...args}
                style={editorBStyle}
                state={stateB}
                onStateChange={e => setStateB(e.after)}
            />
        </div>
    );
};

export const Default = Template.bind({});
Default.args = {};

const initialState = FlowEditorState.empty.set("content", FlowContent.empty.insert(0, new ParagraphBreak()));