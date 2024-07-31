import { Readable } from 'stream';

export interface MulterFile {
    /** Name of the form field associated with this file. */
    fieldname?: string;
    /** Name of the file on the uploader's computer. */
    originalname: string;
    /** Value of the `Content-Type` header for this file. */
    mimetype: string;
    /** Size of the file in bytes. */
    size: number;
    /**
     * A readable stream of this file. Only available to the `_handleFile`
     * callback for custom `StorageEngine`s.
     */
    stream?: Readable;
    /** `DiskStorage` only: Directory to which this file has been uploaded. */
    destination?: string;
    /** `DiskStorage` only: Name of this file within `destination`. */
    filename?: string;
    /** `DiskStorage` only: Full path to the uploaded file. */
    path?: string;
    /** `MemoryStorage` only: A Buffer containing the entire file. */
    buffer?: Buffer;
}
