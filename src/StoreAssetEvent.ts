import { DeferrableEvent } from "./DeferrableEvent";

/**
 * @public
 */
export class StoreAssetEvent extends DeferrableEvent {
    readonly #blob: Blob;
    readonly #uploadId: string;
    #url: string | null = null;
    
    constructor(blob: Blob, uploadId: string) {
        super();
        this.#blob = blob;
        this.#uploadId = uploadId;
    }

    get blob(): Blob | null { return this.#blob; }

    get uploadId(): string { return this.#uploadId; }

    get url(): string | null { return this.#url; }
    set url(value: string | null) { this.#url = value; }
}
