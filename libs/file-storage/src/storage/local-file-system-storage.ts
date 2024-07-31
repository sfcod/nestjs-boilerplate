import {
    LocalFileSystemStorage as LocalFileSystemStorageBase,
    LocalFileSystemStorageConfig as LocalFileSystemStorageConfigBase,
    StorageManager,
} from '@slynova/flydrive';
import { trim } from 'lodash';

export interface AssetFileSystemStorageConfig extends LocalFileSystemStorageConfigBase {
    host: string;
}

export class LocalFileSystemStorage extends LocalFileSystemStorageBase {
    private readonly storageManager: StorageManager;
    private readonly host: string;

    constructor(config: AssetFileSystemStorageConfig) {
        const { host, ...rest } = config;
        super(rest);
        // this.storageManager = new StorageManager({
        //     default: 'local',
        //     disks: {
        //         local: {
        //             driver: 'local',
        //             config: {
        //                 root: config.root,
        //             },
        //         },
        //     },
        // });
        this.host = host;
    }

    getUrl(location: string, uri = false): string {
        return uri ? `/${trim(location, '/')}` : `${this.host}/${trim(location, '/')}`;
    }

    //
    // /**
    //  * Appends content to a file.
    //  *
    //  * Supported drivers: "local"
    //  */
    // append(location: string, content: Buffer | string): Promise<Response> {
    //     return this.storageManager.disk('local').append(location, content);
    // }
    //
    // /**
    //  * Copy a file to a location.
    //  *
    //  * Supported drivers: "local", "s3", "gcs"
    //  */
    // copy(src: string, dest: string): Promise<Response> {
    //     return this.storageManager.disk('local').copy(src, dest);
    // }
    //
    // /**
    //  * Delete existing file.
    //  * The value returned by this method will have a `wasDeleted` property that
    //  * can be either a boolean (`true` if a file was deleted, `false` if there was
    //  * no file to delete) or `null` (if no information about the file is available).
    //  *
    //  * Supported drivers: "local", "s3", "gcs"
    //  */
    // delete(location: string): Promise<DeleteResponse> {
    //     return this.storageManager.disk('local').delete(location);
    // }
    //
    // /**
    //  * Returns the driver.
    //  *
    //  * Supported drivers: "local", "s3", "gcs"
    //  */
    // driver(): unknown {
    //     return this.storageManager.disk('local').driver();
    // }
    //
    // /**
    //  * Determines if a file or folder already exists.
    //  *
    //  * Supported drivers: "local", "s3", "gcs"
    //  */
    // exists(location: string): Promise<ExistsResponse> {
    //     return this.storageManager.disk('local').exists(location);
    // }
    //
    // /**
    //  * Returns the file contents as a string.
    //  *
    //  * Supported drivers: "local", "s3", "gcs"
    //  */
    // get(location: string, encoding?: string): Promise<ContentResponse<string>> {
    //     return this.storageManager.disk('local').get(location, encoding);
    // }
    //
    // /**
    //  * Returns the file contents as a Buffer.
    //  *
    //  * Supported drivers: "local", "s3", "gcs"
    //  */
    // getBuffer(location: string): Promise<ContentResponse<Buffer>> {
    //     return this.storageManager.disk('local').getBuffer(location);
    // }
    //
    // /**
    //  * Returns signed url for an existing file.
    //  *
    //  * Supported drivers: "s3", "gcs"
    //  */
    // getSignedUrl(location: string, options?: SignedUrlOptions): Promise<SignedUrlResponse> {
    //     return this.storageManager.disk('local').getSignedUrl(location, options);
    // }
    //
    // /**
    //  * Returns file's size and modification date.
    //  *
    //  * Supported drivers: "local", "s3", "gcs"
    //  */
    // getStat(location: string): Promise<StatResponse> {
    //     return this.storageManager.disk('local').getStat(location);
    // }
    //
    // /**
    //  * Returns the stream for the given file.
    //  *
    //  * Supported drivers: "local", "s3", "gcs"
    //  */
    // getStream(location: string): NodeJS.ReadableStream {
    //     return this.storageManager.disk('local').getStream(location);
    // }
    //
    // /**
    //  * Move file to a new location.
    //  *
    //  * Supported drivers: "local", "s3", "gcs"
    //  */
    // move(src: string, dest: string): Promise<Response> {
    //     return this.storageManager.disk('local').move(src, dest);
    // }
    //
    // /**
    //  * Creates a new file.
    //  * This method will create missing directories on the fly.
    //  *
    //  * Supported drivers: "local", "s3", "gcs"
    //  */
    // put(location: string, content: Buffer | Readable | string): Promise<Response> {
    //     return this.storageManager.disk('local').put(location, content);
    // }
    //
    // /**
    //  * Prepends content to a file.
    //  *
    //  * Supported drivers: "local"
    //  */
    // prepend(location: string, content: Buffer | string): Promise<Response> {
    //     return this.storageManager.disk('local').prepend(location, content);
    // }
    //
    // /**
    //  * List files with a given prefix.
    //  *
    //  * Supported drivers: "local", "s3", "gcs"
    //  */
    // flatList(prefix?: string): AsyncIterable<FileListResponse> {
    //     return this.storageManager.disk('local').flatList(prefix);
    // }
}
