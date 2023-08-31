import { ReactNode } from "react";
import { Script } from "scribing";

/**
 * @public
 */
export class RenderMarkupTagEvent {
    readonly #tag: string;
    readonly #attr: ReadonlyMap<string, string | Script>;
    readonly #changeAttr: (this: void, key: string, value: string | Script | null) => boolean;
    #content: ReactNode;
    #block: boolean;

    constructor (
        tag: string,
        attr: ReadonlyMap<string, string | Script>,
        changeAttr: (this: void, key: string, value: string | Script | null) => boolean,
    ) {
        this.#tag = tag;
        this.#attr = attr;
        this.#changeAttr = changeAttr;
        this.#block = false;
    }

    public get tag(): string {
        return this.#tag;
    }

    public get attr(): ReadonlyMap<string, string | Script> {
        return this.#attr;
    }

    public get changeAttr(): (this: void, key: string, value: string | Script | null) => boolean {
        return this.#changeAttr;
    }

    public get content(): ReactNode {
        return this.#content;
    }

    public set content(value: ReactNode) {
        this.#content = value;
    }

    public get block(): boolean {
        return this.#block;
    }

    public set block(value: boolean) {
        this.#block = value;
    }
}
