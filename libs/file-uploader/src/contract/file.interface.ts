import { Storage } from '@slynova/flydrive';

export interface File {
    /** Name of the file on the uploader's computer. */
    originalname: string;
    /** Value of the `Content-Type` header for this file. */
    mimetype: string;
    /** Size of the file in bytes. */
    size: number;
    /** Stream  */
    stream?: NodeJS.ReadableStream;
    /** File path */
    path?: string;
    /** Custom function, moving from temporary to permanent dir */
    move?: (disk: Storage, distPath: string, file: any) => Promise<void>;
}
