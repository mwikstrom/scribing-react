import { DeferrableEvent } from "./DeferrableEvent";

/**
 * @public
 */
export class LoadAssetEvent extends DeferrableEvent {
    #url: string;
    #blob: Blob | null = null;
    
    constructor(url: string) {
        super();
        this.#url = url;
    }

    get url(): string { return this.#url; }
    set url(value: string) { this.#url = value; }

    get blob(): Blob | null { return this.#blob; }
    set blob(value: Blob | null) { this.#blob = value; }
}
