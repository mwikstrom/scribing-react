import { FlowEditorState, FlowContent, FlowOperation, TargetOptions, TextRun, TextStyle } from "scribing";
import { mapDomPositionToFlow } from "../mapping/dom-position-to-flow";
import { createFlowSelection } from "../mapping/dom-selection-to-flow";

/** @internal */
export class PendingOperation {
    readonly #parent: Node;
    readonly #childIndex: number;
    readonly #offset: number;
    readonly #text: string;

    constructor (
        parent: Node,
        childIndex: number,
        offset: number,
        text: string,
    ) {
        this.#parent = parent;
        this.#childIndex = childIndex;
        this.#offset = offset;
        this.#text = text;
    }

    append(text: string): PendingOperation {
        return new PendingOperation(this.#parent, this.#childIndex, this.#offset, this.#text + text);
    }

    canAppendAt(target: Node, offset: number): boolean {
        return (
            target === this.#parent.childNodes.item(this.#childIndex) &&
            offset === this.#offset + this.#text.length
        );
    }

    complete(state: FlowEditorState, editingHost: HTMLElement | null): FlowOperation | null {
        if (this.#text === "") {
            return null;
        }

        const target = this.#parent.childNodes.item(this.#childIndex);
        const flowPath = editingHost === null ? null : mapDomPositionToFlow(target, this.#offset, editingHost);
        if (flowPath === null) {
            throw new Error("Cannot map pending operation to flow content");
        }

        const textRun = new TextRun({ text: this.#text, style: TextStyle.empty });
        const content = new FlowContent({ nodes: Object.freeze([textRun])});
        const options: Required<TargetOptions> = { theme: state.theme, target: state.content };
        const flowSelection = createFlowSelection(flowPath);
        return flowSelection.insert(content, options);
    }
}
