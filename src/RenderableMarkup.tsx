import React from "react";
import { ReactNode } from "react";
import { 
    EmptyMarkup,
    FlowContent,
    FlowCursor,
    FlowNode,
    FlowRange,
    ParagraphBreak,
    Script,
    StartMarkup,
} from "scribing";
import { FlowContentView } from "./internal/FlowContentView";
import { MarkupContext } from "./MarkupContext";

/**
 * @public
 */
export class RenderableMarkup implements Omit<MarkupContext, "node"> {
    readonly #node: StartMarkup | EmptyMarkup;
    #content: FlowContent | null;
    readonly #transform: (content: FlowContent) => Promise<FlowContent>;
    readonly #parent: MarkupContext | null;
    readonly #siblingsBefore: readonly (StartMarkup | EmptyMarkup)[];

    constructor(
        node: StartMarkup | EmptyMarkup,
        content: FlowContent | null,
        transform: (content: FlowContent) => Promise<FlowContent>,
        parent: MarkupContext | null,
        siblingsBefore: readonly (StartMarkup | EmptyMarkup)[]
    ) {
        this.#node = node;
        this.#content = content;
        this.#transform = transform;
        this.#parent = parent;
        this.#siblingsBefore = siblingsBefore;
    }

    public get tag(): string {
        return this.#node.tag;
    }

    public get attr(): ReadonlyMap<string, string | Script> {
        return this.#node.attr;
    }

    public get isEmpty(): boolean {
        if (!this.#content) {
            return true;
        }
        const { nodes } = this.#content;
        if (nodes.length < 1) {
            return true;
        } else if (nodes.length > 1) {
            return false;
        } else {
            return nodes[0] instanceof ParagraphBreak;
        }
    }

    public get content(): FlowContent {
        return this.#content || FlowContent.empty;
    }

    public set content(value: FlowContent) {
        this.#content = value;
    }

    public get parent(): MarkupContext | null {
        return this.#parent;
    }

    public get siblingsBefore(): readonly (StartMarkup | EmptyMarkup)[] {
        return this.#siblingsBefore;
    }
    
    public extract(
        predicate: string | RegExp | ((tag: string, attr: ReadonlyMap<string, string | Script>) => boolean)
    ): RenderableMarkup[] {
        if (!this.#content) {
            return [];
        }

        if (typeof predicate === "string") {
            const needle = predicate;
            predicate = (tag: string) => tag === needle;
        } else if (predicate instanceof RegExp) {
            const pattern = predicate;
            predicate = (tag: string) => pattern.test(tag);
        }

        const remainder: FlowNode[] = [];
        const extracted: RenderableMarkup[] = [];
        const siblingsBefore: (EmptyMarkup | StartMarkup)[] = [];
        const context: MarkupContext = Object.freeze({
            node: this.#node,
            parent: this.#parent,
            siblingsBefore: this.#siblingsBefore,
        });

        const pushNext = (node: EmptyMarkup | StartMarkup, content: FlowContent | null) => {
            const next = new RenderableMarkup(
                node,
                content,
                this.#transform,
                context,
                Object.freeze([...siblingsBefore])
            );
            extracted.push(next);
            siblingsBefore.push(node);
        };
    
        let omitNextParaBreak = false;

        for (
            let cursor: FlowCursor | null = this.#content.peek(0);
            cursor !== null;
            cursor = cursor.moveToStartOfNextNode()
        ) {
            const { node } = cursor;

            if (node instanceof EmptyMarkup && predicate(node.tag, node.attr)) {
                pushNext(node, null);
                omitNextParaBreak = true;
                continue;
            }

            if (node instanceof StartMarkup) {
                const end = cursor.findMarkupEnd();
                if (end && predicate(node.tag, node.attr)) {
                    const start = cursor.position + node.size;
                    const distance = end.position - start;
                    const content = this.#content.copy(FlowRange.at(start, distance));
                    pushNext(node, content);
                    cursor = end;
                    omitNextParaBreak = true;
                    continue;
                }
            }

            if (node instanceof ParagraphBreak && omitNextParaBreak) {
                omitNextParaBreak = false;
                continue;
            }

            if (node) {
                remainder.push(node);
                omitNextParaBreak = false;
            }
        }

        this.#content = FlowContent.fromData(remainder);
        return extracted;        
    }    

    public async render(input = this.#content): Promise<ReactNode> {
        if (input) {
            const transformed = await this.#transform(input);
            return <FlowContentView content={transformed}/>;
        } else {
            return null;
        }
    }
}
