import { FlowEditorState, FlowOperation } from "scribing";

/** @internal */
export abstract class PendingOperation {
    // readonly target: Node;
    // readonly offset: number;
    // readonly insert: string;
    abstract complete(state: FlowEditorState): FlowOperation | null;
}
