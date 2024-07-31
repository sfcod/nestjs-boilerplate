import {
    ContentResponse,
    DeleteResponse,
    ExistsResponse,
    FileListResponse,
    FileNotFound,
    NoSuchBucket,
    PermissionMissing,
    Response,
    SignedUrlOptions,
    SignedUrlResponse,
    StatResponse,
    Storage,
    UnknownException,
} from '@slynova/flydrive';
import { trim } from 'lodash';
import {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
    DeleteObjectCommand,
    CopyObjectCommand,
    HeadObjectCommand,
    ListObjectsV2Command,
    S3ClientConfig,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { ReadableWebToNodeStream } from '../utils/readable-web-to-node-stream';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function handleError(err: any, path: any, bucket: any) {
    switch (err.name) {
        case 'NoSuchBucket':
            return new NoSuchBucket(err, bucket);
        case 'NoSuchKey':
            return new FileNotFound(err, path);
        case 'AllAccessDisabled':
            return new PermissionMissing(err, path);
        default:
            return new UnknownException(err, err.name, path);
    }
}

export class AmazonWebServicesS3Storage extends Storage {
    protected $driver: S3Client;
    protected $bucket: string;

    constructor(config: AmazonWebServicesS3StorageConfig) {
        super();
        this.$driver = new S3Client({
            credentials: {
                accessKeyId: config.key,
                secretAccessKey: config.secret,
            },
            region: config.region,
            useAccelerateEndpoint: config.useAccelerateEndpoint,
        });

        this.$bucket = config.bucket;
    }

    async getSignedUrl(location: string, options: SignedUrlOptions = { expiry: 900 }): Promise<SignedUrlResponse> {
        const { expiry } = options;
        try {
            const params = {
                Key: location,
                Bucket: this.$bucket,
                Expires: expiry,
            };

            const command = new GetObjectCommand(params);
            const result = await getSignedUrl(this.$driver, command, { expiresIn: options.expiry });

            return { signedUrl: result, raw: result };
        } catch (e) {
            throw handleError(e, location, this.$bucket);
        }
    }

    getUrl(location: string, uri = false): string {
        return uri ? `s3://${this.$bucket}/${trim(location, '/')}` : super.getUrl(location);
    }

    /**
     * Copy a file to a location.
     */
    public async copy(src: string, dest: string): Promise<Response> {
        const params = {
            Key: dest,
            Bucket: this.$bucket,
            CopySource: `/${this.$bucket}/${src}`,
        };

        try {
            const result = await this.$driver.send(new CopyObjectCommand(params));
            return { raw: result };
        } catch (e) {
            throw handleError(e, src, this.$bucket);
        }
    }

    /**
     * Delete existing file.
     */
    public async delete(location: string): Promise<DeleteResponse> {
        const params = { Key: location, Bucket: this.$bucket };

        try {
            const command = new DeleteObjectCommand(params);
            const result = await this.$driver.send(command);

            // Amazon does not inform the client if anything was deleted.
            return { raw: result, wasDeleted: null };
        } catch (e) {
            throw handleError(e, location, this.$bucket);
        }
    }

    /**
     * Returns the driver.
     */
    public driver(): S3Client {
        return this.$driver;
    }

    /**
     * Determines if a file or folder already exists.
     */
    public async exists(location: string): Promise<ExistsResponse> {
        const params = { Key: location, Bucket: this.$bucket };

        try {
            const command = new HeadObjectCommand(params);
            const result = await this.$driver.send(command);

            return { exists: true, raw: result };
        } catch (e) {
            if (e.statusCode === 404) {
                return { exists: false, raw: e };
            } else {
                throw handleError(e, location, this.$bucket);
            }
        }
    }

    /**
     * Returns the file contents.
     */
    public async get(location: string, encoding: BufferEncoding = 'utf-8'): Promise<ContentResponse<string>> {
        const bufferResult = await this.getBuffer(location);
        return {
            content: bufferResult.content.toString(encoding),
            raw: bufferResult.raw,
        };
    }

    /**
     * Returns the file contents as Buffer.
     */
    public async getBuffer(location: string): Promise<ContentResponse<Buffer>> {
        const params = { Key: location, Bucket: this.$bucket };
        const command = new GetObjectCommand(params);

        try {
            const response = await this.$driver.send(command);
            if (response.Body instanceof Readable) {
                const chunks: Buffer[] = [];
                for await (const chunk of response.Body as Readable) {
                    chunks.push(Buffer.from(chunk));
                }
                const buffer = Buffer.concat(chunks);
                return {
                    content: buffer,
                    raw: {
                        responseMetadata: response.$metadata,
                        contentType: response.ContentType,
                        contentLength: response.ContentLength,
                        lastModified: response.LastModified,
                    },
                };
            } else {
                throw new Error('Response body is not a stream');
            }
        } catch (error) {
            throw new Error(`Error fetching object from S3: ${error.message}`);
        }
    }

    /**
     * Returns file's size and modification date.
     */
    public async getStat(location: string): Promise<StatResponse> {
        const params = { Key: location, Bucket: this.$bucket };

        try {
            // const result = await this.$driver.headObject(params).promise();
            const command = new HeadObjectCommand(params);
            const result = await this.$driver.send(command);

            return {
                size: result.ContentLength as number,
                modified: result.LastModified as Date,
                raw: result,
            };
        } catch (e) {
            throw handleError(e, location, this.$bucket);
        }
    }

    /**
     * Returns the stream for the given file.
     */
    public getStream(location: string): NodeJS.ReadableStream {
        const params = { Key: location, Bucket: this.$bucket };
        const command = new GetObjectCommand(params);

        const passThrough = new Readable({
            read() {},
        });

        this.$driver
            .send(command)
            .then((response) => {
                const webStream = response.Body.transformToWebStream();
                const nodeStream = new ReadableWebToNodeStream(webStream).getNodeStream();

                nodeStream.on('data', (chunk) => passThrough.push(chunk));
                nodeStream.on('end', () => passThrough.push(null));
                nodeStream.on('error', (err) => passThrough.emit('error', err));
            })
            .catch((error) => {
                passThrough.emit('error', error);
            });

        return passThrough;
    }

    /**
     * Moves file from one location to another. This
     * method will call `copy` and `delete` under
     * the hood.
     */
    public async move(src: string, dest: string): Promise<Response> {
        await this.copy(src, dest);
        await this.delete(src);
        return { raw: undefined };
    }

    /**
     * Creates a new file.
     * This method will create missing directories on the fly.
     */
    public async put(location: string, content: Buffer | NodeJS.ReadableStream | string): Promise<Response> {
        const params = {
            Key: location,
            Body: content instanceof Buffer || typeof content === 'string' ? content : (content as Readable),
            Bucket: this.$bucket,
        };
        try {
            const command = new PutObjectCommand(params);
            const result = await this.$driver.send(command);
            return { raw: result };
        } catch (e) {
            throw handleError(e, location, this.$bucket);
        }
    }

    /**
     * Iterate over all files in the bucket.
     */
    public async *flatList(prefix = ''): AsyncIterable<FileListResponse> {
        let continuationToken: string | undefined;
        do {
            const params = {
                Bucket: this.$bucket,
                Prefix: prefix,
                ContinuationToken: continuationToken,
                MaxKeys: 1000,
            };

            const command = new ListObjectsV2Command(params);
            const response = await this.$driver.send(command);

            continuationToken = response.NextContinuationToken;
            for (const file of response.Contents) {
                yield { raw: file, path: file.Key };
            }
        } while (continuationToken);
    }
}

export interface AmazonWebServicesS3StorageConfig extends S3ClientConfig {
    key: string;
    secret: string;
    bucket: string;
    region: string;
    useAccelerateEndpoint?: boolean;
}
