import { DeferrableEvent } from "./DeferrableEvent";

/**
 * @public
 */
export class StoreAssetEvent extends DeferrableEvent {
    readonly #blob: Blob;
    readonly #uploadId: string;
    readonly #supplementaryBlobs = new Map<string, Blob>();
    readonly #supplementaryUrls = new Map<string, string>();
    readonly #progressListener?: StoreAssetProgressListener;
    #url: string | null = null;
    
    constructor(
        blob: Blob,
        uploadId: string,
        supplementaryBlobs?: Readonly<Record<string, Blob | null | undefined>>,
        progressListener?: StoreAssetProgressListener,
    ) {
        super();
        this.#blob = blob;
        this.#uploadId = uploadId;
        this.#progressListener = progressListener;

        if (supplementaryBlobs) {
            for (const [key, value] of Object.entries(supplementaryBlobs)) {
                if (value) {
                    this.#supplementaryBlobs.set(key, value);
                }
            }
        }
    }

    get blob(): Blob | null { return this.#blob; }

    get uploadId(): string { return this.#uploadId; }

    get url(): string | null { return this.#url; }
    set url(value: string | null) { this.#url = value; }

    get supplementaryCount(): number {
        return this.#supplementaryBlobs.size;
    }

    get supplementaryKeys(): IterableIterator<string> {
        return this.#supplementaryBlobs.keys();
    }

    getSupplementaryBlob(key: string): Blob | undefined {
        return this.#supplementaryBlobs.get(key);
    }

    getSupplementaryUrl(key: string): string | undefined {
        return this.#supplementaryUrls.get(key);
    }

    setSupplementaryUrl(key: string, url: string): void {
        this.#supplementaryUrls.set(key, url);
    }

    reportProgress(progress: StoreAssetProgress): void {
        const listener = this.#progressListener;
        if (listener) {
            listener(progress);
        }
    }
}

/** @public */
export type StoreAssetProgressListener = (progress: StoreAssetProgress) => void;

/** @public */
export interface StoreAssetProgress {
    message: string;
}
