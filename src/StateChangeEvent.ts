import { FlowOperation } from "scribing";
import { FlowEditorState } from "./FlowEditorState";

/**
 * @public
 */
export class StateChangeEvent {
    readonly #before: FlowEditorState;
    readonly #change: FlowOperation | null;
    readonly #after: FlowEditorState;
    #rejected = false;

    constructor(before: FlowEditorState, change: FlowOperation | null, after: FlowEditorState) {
        this.#before = before;
        this.#change = change;
        this.#after = after;
    }

    get before(): FlowEditorState { return this.#before; }
    
    get change(): FlowOperation | null { return this.#change; }

    get after(): FlowEditorState { return this.#after; }

    get rejected(): boolean { return this.#rejected; }

    reject(): void { this.#rejected = true; }
}