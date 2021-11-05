import { nanoid } from "nanoid";
import { Upload } from "./Upload";
import { UploadManager } from "./UploadManager";

/** @internal */
export class TransientUploadManager implements UploadManager {
    readonly #map = new Map<string, Upload>();
    
    public static get instance(): TransientUploadManager {
        return SINGLETON;
    }

    public begin(blob: Blob): Upload {
        const id = nanoid();
        const upload = Object.freeze({ id, blob });
        this.#map.set(id, upload);
        return upload;
    }

    public get(id: string): Upload | null {
        return this.#map.get(id) ?? null;
    }
}

const SINGLETON = new TransientUploadManager();
