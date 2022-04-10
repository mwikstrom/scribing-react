import { FlowColor, Script } from "scribing";
import { DeferrableEvent } from "./DeferrableEvent";

/**
 * @public
 */
export class FormatMarkupAttributeEvent extends DeferrableEvent {
    readonly #tag: string;
    readonly #key: string;
    #value: string | Script;
    #url = "";
    #color: FlowColor | undefined;

    constructor(tag: string, key: string, value: string | Script) {
        super();
        this.#tag = tag;
        this.#key = key;
        this.#value = value;
    }

    public get tag(): string { return this.#tag; }

    public get key(): string { return this.#key; }

    public get value(): string | Script { return this.#value; }
    public set value(value: string | Script) { this.#value = value; }

    public get url(): string { return this.#url; }
    public set url(value: string) { this.#url = value; }

    public get color(): FlowColor {
        if (this.#color) {
            return this.#color;
        } else if (this.#url) {
            return "primary";
        } else if (this.pending || typeof this.#value !== "string") {
            return "subtle";
        } else {
            return "default";
        }
    }

    public set color(value: FlowColor) { this.#color = value; }
}
