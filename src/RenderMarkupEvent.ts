import { ReactNode } from "react";
import { EmptyMarkup, FlowContent, StartMarkup } from "scribing";
import { RenderableMarkup } from ".";
import { DeferrableEvent } from "./DeferrableEvent";

/**
 * @public
 */
export class RenderMarkupEvent extends DeferrableEvent {
    readonly #markup: RenderableMarkup;
    #result: FlowContent | ReactNode;
    #scope: readonly (StartMarkup | EmptyMarkup)[] | undefined;

    constructor(markup: RenderableMarkup) {
        super();
        this.#markup = markup;
    }
    
    public get markup(): RenderableMarkup {
        return this.#markup;
    }

    public get scope(): readonly (StartMarkup | EmptyMarkup)[] {
        if (!this.#scope) {
            const result: (StartMarkup | EmptyMarkup)[] = [];
            for (let context = this.#markup.parent; context; context = context.parent) {
                result.push(context.node);
            }
            this.#scope = Object.freeze(result);
        }
        return this.#scope;
    }

    public get result(): FlowContent | ReactNode {
        return this.#result;
    }

    public set result(value: FlowContent | ReactNode) {
        this.#result = value;
    }
}
