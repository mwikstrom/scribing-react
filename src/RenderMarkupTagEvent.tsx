import { ReactNode } from "react";
import { Script } from "scribing";

/**
 * @public
 */
export type RenderMarkupTagDisplay = "inline" | "block";

/**
 * @public
 */
export class RenderMarkupTagEvent {
    readonly #tag: string;
    readonly #attr: ReadonlyMap<string, string | Script>;
    readonly #changeAttr: (this: void, key: string, value: string | Script | null) => boolean;
    #content: ReactNode;
    #style: React.CSSProperties | undefined;
    #display: RenderMarkupTagDisplay;

    constructor (
        tag: string,
        attr: ReadonlyMap<string, string | Script>,
        changeAttr: (this: void, key: string, value: string | Script | null) => boolean,
    ) {
        this.#tag = tag;
        this.#attr = attr;
        this.#changeAttr = changeAttr;
        this.#display = "inline";
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

    public get display(): RenderMarkupTagDisplay {
        return this.#display;
    }

    public set display(value: RenderMarkupTagDisplay) {
        this.#display = value;
    }

    public get style(): React.CSSProperties | undefined {
        return this.#style;
    }

    public set style(value: React.CSSProperties | undefined) {
        this.#style = value;
    }
}
