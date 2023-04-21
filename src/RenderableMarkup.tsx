import React from "react";
import { ReactNode } from "react";
import { 
    EmptyMarkup,
    FlowContent,
    Script,
    StartMarkup,
    MarkupProcessingScope,
    extractMarkup,
    MarkupHandlerInput,
    processNestedMarkup,
    isEmptyFlowContent,
} from "scribing";
import { FlowContentView } from "./internal/FlowContentView";

/**
 * @public
 */
export class RenderableMarkup implements Omit<MarkupProcessingScope, "node"> {
    readonly #input: MarkupHandlerInput<ReactNode>;
    #content: FlowContent | null;

    constructor(input: MarkupHandlerInput<ReactNode>) {
        this.#input = input;
        this.#content = input.content;
    }

    public get node(): StartMarkup | EmptyMarkup {
        return this.#input.node;
    }

    public get tag(): string {
        return this.#input.node.tag;
    }

    public get attr(): ReadonlyMap<string, string | Script> {
        return this.#input.node.attr;
    }

    public get isEmpty(): boolean {
        return isEmptyFlowContent(this.#content);
    }

    public get content(): FlowContent {
        return this.#content || FlowContent.empty;
    }

    public set content(value: FlowContent) {
        this.#content = value;
    }

    public get parent(): MarkupProcessingScope | null {
        return this.#input.parent;
    }

    public get siblingsBefore(): readonly (StartMarkup | EmptyMarkup)[] {
        return this.#input.siblingsBefore;
    }
    
    public extract(
        predicate: string | RegExp | ((tag: string, attr: ReadonlyMap<string, string | Script>) => boolean)
    ): RenderableMarkup[] {
        if (!this.#content) {
            return [];
        }

        const input = { ...this.#input, content: this.#content };
        const [remainder, ...extracted] = extractMarkup(input, predicate);

        this.#content = remainder;
        return extracted.map(input => new RenderableMarkup(input));        
    }    

    public async render(content = this.#content): Promise<ReactNode> {
        if (content) {
            const transformed = await processNestedMarkup(this.#input, content);
            return <FlowContentView content={transformed}/>;
        } else {
            return null;
        }
    }
}
