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
    debug?: boolean;
}

const ClientFlowEditor: FC<ClientFlowEditorProps> = props => {
    const { id, server, manual, debug, style, className, ...rest } = props;
    const proto = useMemo(() => createTestProtocol(server, id, debug), [server, id, debug]);
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
    const canDisconnect = canSync || client.connection === "broken";
    const canReconnect = canDisconnect || client.connection === "disconnected";
    const syncNow = useCallback(() => client.sync(), [client]);
    const beginSync = useCallback(() => {
        setDeferred(true);
        client.sync();
    }, [client, setDeferred]);
    const endSync = useCallback(() => setDeferred(false), [setDeferred]);
    const disconnect = useCallback(() => client.disconnect(), [client]);
    const reconnect = useCallback(() => client.reconnect(), [client]);
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
                <button onClick={disconnect} disabled={!canDisconnect}>Disconnect</button>
                <button onClick={reconnect} disabled={!canReconnect}>Reconnect</button>
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
    const server = useMemo(() => new FlowSyncServer(), []);
    const [ready, setReady] = useState(false);  

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
        setReady(false);
        let active = true;
        (async () => {
            await server.init(initialContent);
            if (active) {                
                setReady(true);
            }
        })();
        return () => { active = false; };
    }, [server]);

    return (
        <div style={wrapperStyle}>
            {ready && (
                <>
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
                </>
            )}
        </div>
    );
};

export const AutoSync = Template.bind({});
AutoSync.args = {};

export const ManualSync = Template.bind({});
ManualSync.args = { manual: true };

const createTestProtocol = (server: FlowSyncServer, user: string, debug: boolean | undefined): FlowSyncProtocol => ({
    read: () => server.read(),
    sync: async input => {
        if (debug) {
            console.log(`[${user}] sync:`, FlowSyncInputType.toJsonValue(input));
        }
        const output = await server.sync(input, user);
        if (debug) {
            console.log(`[${user}] merge:`, output?.version, output?.merge?.toJsonValue());
        }
        return output;
    },
});
