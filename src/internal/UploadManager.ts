import { Upload } from "./Upload";

/** @internal */
export interface UploadManager {
    begin(blob: Blob): Upload;
    get(id: string): Upload | null;
}
