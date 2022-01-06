import { ReactNode } from "react";
import { FlowContent } from "scribing";
import { RenderableMarkup } from ".";
import { DeferrableEvent } from "./DeferrableEvent";

/**
 * @public
 */
export class RenderMarkupEvent extends DeferrableEvent {
    readonly #markup: RenderableMarkup;
    #result: FlowContent | ReactNode;

    constructor(markup: RenderableMarkup) {
        super();
        this.#markup = markup;
    }
    
    public get markup(): RenderableMarkup {
        return this.#markup;
    }

    public get result(): FlowContent | ReactNode {
        return this.#result;
    }

    public set result(value: FlowContent | ReactNode) {
        this.#result = value;
    }
}
