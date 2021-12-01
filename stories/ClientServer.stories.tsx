import React, { CSSProperties, FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { FlowEditor, FlowEditorProps } from "../src/FlowEditor";
import { FlowSyncServer } from "scribing-server";
import { FlowContent, FlowSyncInputType, FlowSyncProtocol } from "scribing";
import { DeferrableEvent, useFlowEditorClient } from "../src";

interface ClientFlowEditorProps extends FlowEditorProps {
    id: string;
    server: FlowSyncServer;
    manual?: boolean;
}

const ClientFlowEditor: FC<ClientFlowEditorProps> = props => {
    const { id, server, manual, style, className, ...rest } = props;
    const proto = useMemo(() => createTestProtocol(server, id), [server, id]);
    const [isDeferred, setDeferred] = useState(false);
    const queue = useRef<Array<() => void>>([]);
    const onSyncing = useCallback((e: DeferrableEvent) => {
        if (isDeferred) {
            e.defer(() => new Promise(resolve => queue.current.push(resolve)));
        }
    }, [isDeferred]);
    const client = useFlowEditorClient(proto, { clientKey: id, autoSync: !manual, onSyncing });
    const canSync = client.connection === "clean" || client.connection === "dirty";
    const canEndSync = client.connection === "syncing" && isDeferred;
    const syncNow = useCallback(() => client.sync(), [client]);
    const beginSync = useCallback(() => {
        setDeferred(true);
        client.sync();
    }, [client, setDeferred]);
    const endSync = useCallback(() => setDeferred(false), [setDeferred]);
    useEffect(() => {
        if (!isDeferred) {
            queue.current.forEach(callback => callback());
            queue.current = [];
        }
    }, [isDeferred]);
    return (
        <div style={style} className={className}>
            <div style={{ display: "flex", flexDirection: "row" }}>
                <button onClick={syncNow} disabled={!canSync}>Sync Now</button>
                <button onClick={beginSync} disabled={!canSync}>Begin Sync</button>
                <button onClick={endSync} disabled={!canEndSync}>End Sync</button>
                <pre style={{flex: 1, paddingLeft: 10}}>{client.connection}</pre>
            </div>
            {client.state && (
                <FlowEditor
                    {...rest}
                    state={client.state}
                    onStateChange={client.apply}
                />
            )}
        </div>
    );
};

export default {
    title: "ClientServer",
    component: ClientFlowEditor,
} as ComponentMeta<typeof ClientFlowEditor>;

const initialContent = FlowContent.fromJsonValue([
    "This is the initial server content",
    { break: "para" },
]);
  
const Template: ComponentStory<typeof ClientFlowEditor> = args => {
    const server = useMemo(() => new FlowSyncServer({ initialContent }), []);

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

    return (
        <div style={wrapperStyle}>
            <ClientFlowEditor 
                {...args}
                style={editorAStyle}
                server={server}
                id={"A"}
            />
            <ClientFlowEditor 
                {...args}
                style={editorBStyle}
                server={server}
                id={"B"}
            />
        </div>
    );
};

export const AutoSync = Template.bind({});
AutoSync.args = {};

export const ManualSync = Template.bind({});
ManualSync.args = { manual: true };

const createTestProtocol = (server: FlowSyncServer, user: string): FlowSyncProtocol => ({
    read: () => server.read(),
    sync: async input => {
        console.log(`[${user}] sync:`, FlowSyncInputType.toJsonValue(input));
        const output = await server.sync(input, user);
        console.log(`[${user}] merge:`, output?.version, output?.merge?.toJsonValue());
        return output;
    },
});
