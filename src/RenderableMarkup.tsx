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

/**
 * @public
 */
export class RenderableMarkup {
    readonly #node: StartMarkup | EmptyMarkup;
    #content: FlowContent | null;
    readonly #transform: (content: FlowContent) => Promise<FlowContent>;

    constructor(
        node: StartMarkup | EmptyMarkup,
        content: FlowContent | null,
        transform: (content: FlowContent) => Promise<FlowContent>,
    ) {
        this.#node = node;
        this.#content = content;
        this.#transform = transform;
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
        let omitNextParaBreak = false;

        for (
            let cursor: FlowCursor | null = this.#content.peek(0);
            cursor !== null;
            cursor = cursor.moveToStartOfNextNode()
        ) {
            const { node } = cursor;

            if (node instanceof EmptyMarkup && predicate(node.tag, node.attr)) {
                extracted.push(new RenderableMarkup(node, null, this.#transform));
                omitNextParaBreak = true;
                continue;
            }

            if (node instanceof StartMarkup) {
                const end = cursor.findMarkupEnd();
                if (end && predicate(node.tag, node.attr)) {
                    const start = cursor.position + node.size;
                    const distance = end.position - start;
                    const content = this.#content.copy(FlowRange.at(start, distance));
                    extracted.push(new RenderableMarkup(node, content, this.#transform));
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

    public async render(): Promise<ReactNode> {
        if (this.#content) {
            const content = await this.#transform(this.#content);
            return <FlowContentView content={content}/>;
        } else {
            return null;
        }
    }
}
