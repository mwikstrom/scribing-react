import { ReactNode } from "react";
import { EmptyMarkup, FlowContent, StartMarkup } from "scribing";
import { RenderableMarkup } from ".";
import { DeferrableEvent } from "./DeferrableEvent";

/**
 * @public
 */
export class RenderMarkupEvent extends DeferrableEvent {
    readonly #markup: RenderableMarkup;
    readonly #scope: readonly (StartMarkup | EmptyMarkup)[];
    #result: FlowContent | ReactNode;

    constructor(markup: RenderableMarkup, scope: readonly (StartMarkup | EmptyMarkup)[]) {
        super();
        this.#markup = markup;
        this.#scope = scope;
    }
    
    public get markup(): RenderableMarkup {
        return this.#markup;
    }

    public get scope(): readonly (StartMarkup | EmptyMarkup)[] {
        return this.#scope;
    }

    public get result(): FlowContent | ReactNode {
        return this.#result;
    }

    public set result(value: FlowContent | ReactNode) {
        this.#result = value;
    }
}
