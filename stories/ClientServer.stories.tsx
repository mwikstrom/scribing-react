import React, { CSSProperties, useMemo } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { FlowEditor } from "../src/FlowEditor";
import { FlowSyncServer } from "scribing-server";
import { FlowContent, FlowSyncProtocol } from "scribing";
import { useFlowEditorClient } from "../src";

export default {
    title: "ClientServer",
    component: FlowEditor,
} as ComponentMeta<typeof FlowEditor>;

const initialContent = FlowContent.fromJsonValue([
    "This is the initial server content",
    { break: "para" },
]);
  
const Template: ComponentStory<typeof FlowEditor> = args => {
    const server = useMemo(() => new FlowSyncServer({ initialContent }), []);
    const protoA = useMemo(() => createTestProtocol(server, "A"), [server]);
    const protoB = useMemo(() => createTestProtocol(server, "B"), [server]);
    const clientA = useFlowEditorClient(protoA, { clientKey: "A" });
    const clientB = useFlowEditorClient(protoB, { clientKey: "B" });

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
        borderLeft: clientA.state !== null && clientB.state !== null ? "1px solid #888" : "none",
    }), [clientA.state !== null && clientB.state !== null]);

    return (
        <div style={wrapperStyle}>
            {clientA.state && (
                <FlowEditor 
                    {...args}
                    style={editorAStyle}
                    state={clientA.state}
                    onStateChange={clientA.apply}
                />
            )}
            {clientB.state && (
                <FlowEditor 
                    {...args}
                    style={editorBStyle}
                    state={clientB.state}
                    onStateChange={clientB.apply}
                />
            )}
        </div>
    );
};

export const AutoSync = Template.bind({});
AutoSync.args = {};

const createTestProtocol = (server: FlowSyncServer, user: string): FlowSyncProtocol => ({
    read: () => server.read(),
    sync: async input => {
        console.log(`[${user}] sync:`, input);
        const output = await server.sync(input, user);
        console.log(`[${user}] merge:`, output?.version, output?.merge);
        return output;
    },
});
