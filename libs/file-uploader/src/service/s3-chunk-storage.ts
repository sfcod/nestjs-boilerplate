import { createReadStream } from 'fs';
import { join } from 'path';
import * as del from 'del';
import { ChunkStorage } from '../contract/chunk-storage.interface';
import { File } from '../contract/file.interface';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
    S3Client,
    CreateMultipartUploadCommandOutput,
    CreateMultipartUploadCommand,
    UploadPartCommand,
    UploadPartCopyCommandInput,
    UploadPartCopyCommandOutput,
    CompleteMultipartUploadCommand,
    ListPartsCommand,
    GetObjectCommand,
    HeadObjectCommand,
    UploadPartCopyCommand,
    CopyObjectCommand,
    DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { RedisService } from '@songkeys/nestjs-redis';
import { UploadException } from '../exception/upload.exception';
import { Storage } from '@slynova/flydrive';
import { ReadableWebToNodeStream } from '@libs/file-storage';

type MultyPartType = {
    originalname: string;
    multipart?: CreateMultipartUploadCommandOutput;
    multipartMap?: { Parts: { ETag: string; PartNumber: number }[] };
    multiPartParams?: any;
};

const COPY_OBJECT_LIMIT = 1024 * 1024 * 50; // 50mb
const COPY_OBJECT_LIMIT_VIA_CHUNK = 1024 * 1024 * 30; // 30mb

@Injectable()
export class S3ChunkStorage implements ChunkStorage {
    private readonly logger = new Logger(this.constructor.name);

    constructor(
        @Inject('S3ChunkDriver') private readonly driver: S3Client,
        @Inject('S3_CHUNK_BUCKET') private readonly bucket: string,
        // @Inject('RedisService')
        private readonly redisService: RedisService,
    ) {}

    async addChunk(uuid: string, index: number, chunk: File): Promise<File> {
        const path = this.getDirPath(uuid);
        const name = `${index.toString()}_${chunk.originalname}`;
        const redis = this.redisService.getClient();
        const isDev = process.env.NODE_ENV === 'development';

        let multipart: MultyPartType;
        if (index === 0) {
            isDev && console.time(`createMultipartUpload-${uuid}`);
            const multiPartParams = {
                Bucket: this.bucket,
                Key: join(path, chunk.originalname),
            };
            const createMultipartUploadCommand = new CreateMultipartUploadCommand(multiPartParams);
            multipart = {
                originalname: chunk.originalname,
                multiPartParams: multiPartParams,
                multipart: await this.driver.send(createMultipartUploadCommand),
            };
            await redis.set(uuid, JSON.stringify(multipart), 'EX', 60 * 60 * 24);
            isDev && console.timeEnd(`createMultipartUpload-${uuid}`);
        } else {
            isDev && console.time(`getMultyPartData-${uuid}-${index}`);
            multipart = await this.getMultyPartData(uuid);
            isDev && console.timeEnd(`getMultyPartData-${uuid}-${index}`);
        }
        if (Object.keys(multipart).length <= 0) {
            throw new UploadException(`The first chunk did not upload. Please upload chunk index 0.`);
        }
        isDev && console.time(`uploadPart-${multipart.multipart.UploadId}-${index}`);
        const partParams = {
            Bucket: this.bucket,
            Key: join(path, chunk.originalname),
            Body: createReadStream(chunk.path),
            PartNumber: index + 1,
            UploadId: multipart.multipart.UploadId,
        };
        const uploadPartCommand = new UploadPartCommand(partParams);
        const result = await this.driver.send(uploadPartCommand);
        isDev && console.timeEnd(`uploadPart-${multipart.multipart.UploadId}-${index}`);
        if (!result.ETag) {
            console.error('Can not upload chunk', partParams);
        }

        // Delete file from local disk
        await del(chunk.path);

        chunk.path = join(path, name);
        chunk.originalname = name;

        return chunk;
    }

    async assembleChunks(chunks: File[]): Promise<File> {
        const uuid = (chunks as any)[0].uuid;
        const redis = this.redisService.getClient();
        const multipart = await this.getMultyPartData(uuid);

        const listPartsCommand = new ListPartsCommand({
            Bucket: this.bucket,
            Key: multipart.multiPartParams.Key,
            UploadId: multipart.multipart.UploadId,
        });

        const parts = await this.driver.send(listPartsCommand);

        const lastChunk = parts.Parts[parts.Parts.length - 1];
        if (parts.Parts.length < lastChunk.PartNumber) {
            const partNumbers = [...Array(lastChunk.PartNumber).keys()];
            const uploadedPartNumbers = parts.Parts.map((part) => part.PartNumber - 1);
            const areNotUploadedParts = partNumbers.filter((part) => {
                return !uploadedPartNumbers.includes(part);
            });
            throw new UploadException(`Chunk indexes are not uploaded: ${areNotUploadedParts.join(',')}`);
        }

        const doneParams = {
            ...multipart.multiPartParams,
            MultipartUpload: {
                Parts: parts.Parts.map((part) => {
                    return {
                        ETag: part.ETag,
                        PartNumber: part.PartNumber,
                    };
                }),
            },
            UploadId: multipart.multipart.UploadId,
        };

        const completeMultipartUploadCommand = new CompleteMultipartUploadCommand(doneParams);
        await this.driver.send(completeMultipartUploadCommand);
        await redis.del(uuid);

        const params = { Key: multipart.multiPartParams.Key, Bucket: this.bucket };
        const headObjectCommand = new HeadObjectCommand(params);
        const stat = await this.driver.send(headObjectCommand);

        const getObjectCommand = new GetObjectCommand(params);
        const response = await this.driver.send(getObjectCommand);
        const webStream = response.Body.transformToWebStream();
        const nodeStream = new ReadableWebToNodeStream(webStream).getNodeStream();

        return {
            originalname: multipart.originalname,
            mimetype: stat.ContentType,
            size: stat.ContentLength,
            path: multipart.multiPartParams.Key,
            stream: nodeStream,
            move: this.move,
        };
    }

    move = async (disk: Storage, distPath: string, file: any): Promise<void> => {
        const copyParams = {
            CopySource: this.bucket + '/' + file.path,
            Bucket: this.bucket,
            Key: distPath,
        };
        const delParams = {
            Key: file.path,
            Bucket: this.bucket,
        };

        if (file.size < COPY_OBJECT_LIMIT) {
            try {
                const copyCommand = new CopyObjectCommand(copyParams);
                await this.driver.send(copyCommand);
            } catch (e) {
                this.logger.error(
                    `Moving via copyObject is failed. Message: ${e.message}. Params: ${JSON.stringify(copyParams)}`,
                    e,
                );
                throw e;
            }
        } else {
            try {
                await this.moveViaChunk(disk, distPath, file);
            } catch (e) {
                this.logger.error(
                    `Moving via chunk is failed. Message: ${e.message}. Params: ${JSON.stringify(copyParams)}}`,
                    e,
                );
                throw e;
            }
        }
        try {
            const deleteCommand = new DeleteObjectCommand(delParams);
            await this.driver.send(deleteCommand);
        } catch (e) {
            this.logger.error(
                `Delete object is failed. Message: ${e.message}. Params: ${JSON.stringify(delParams)}`,
                e,
            );
            throw e;
        }
        // // If file bigger than COPY_OBJECT_LIMIT then run it in Promise, without waiting continue the app process.
        // new Promise((resolve, reject) => {
        //     this.moveViaChunk(disk, distPath, file).then(resolve).catch(reject);
        // })
        //     .then(async () => {
        //         try {
        //             await this.driver.deleteObject(delParams).promise();
        //         } catch (e) {
        //             console.log(`Delete object is failed. Params: ${JSON.stringify(delParams)}`);
        //             throw e;
        //         }
        //     })
        //     .catch((e) => {
        //         console.log(e);
        //         console.log(`Moving via chunk is failed. Params: ${JSON.stringify(copyParams)}`);
        //     });
    };

    async moveViaChunk(disk: Storage, distPath: string, file: any) {
        const multiPartParams = {
            Bucket: this.bucket,
            Key: distPath,
            // ContentType: getContentType(to_key),
        };
        const multipartMap = {
            Parts: [],
        };
        const headObjectCommand = new HeadObjectCommand({
            Bucket: this.bucket,
            Key: file.path,
        });

        const info = await this.driver.send(headObjectCommand);
        const size = info.ContentLength;

        const createMultipartUploadCommand = new CreateMultipartUploadCommand(multiPartParams);
        const multipartUpload = await this.driver.send(createMultipartUploadCommand);
        const queue = [];
        for (let start = 0; start < size; start += COPY_OBJECT_LIMIT_VIA_CHUNK) {
            const end = Math.min(start + COPY_OBJECT_LIMIT_VIA_CHUNK, size);
            const partNumber = queue.length + 1;
            const copyParams: UploadPartCopyCommandInput = {
                ...multiPartParams,
                PartNumber: Number(partNumber),
                UploadId: multipartUpload.UploadId,
                CopySource: `${this.bucket}/${file.path}`,
                CopySourceRange: `bytes=${start}-${end - 1}`,
            };
            const uploadPartCopyCommand = new UploadPartCopyCommand(copyParams);
            queue.push({ partNumber: Number(partNumber), func: this.driver.send(uploadPartCopyCommand) });
        }
        await Promise.all(
            queue.map(async (item) => {
                const res: UploadPartCopyCommandOutput = await item.func;
                multipartMap.Parts[Number(item.partNumber) - 1] = {
                    ETag: res.CopyPartResult.ETag,
                    PartNumber: Number(item.partNumber),
                };
            }),
        );
        // result.map((item) => {
        //     multipartMap.Parts.push({ ETag: item.ETag, PartNumber: Number(item.) });
        // })
        // const result: S3.Types.UploadPartOutput = await this.driver.uploadPartCopy(copyParams).promise();
        //
        // multipartMap.Parts.push({ ETag: result.ETag, PartNumber: Number(partNumber) });

        const doneParams = {
            ...multiPartParams,
            MultipartUpload: multipartMap,
            UploadId: multipartUpload.UploadId,
        };

        await this.driver.send(new CompleteMultipartUploadCommand(doneParams));
    }

    async getMultyPartData(uuid: string): Promise<MultyPartType> {
        const redis = this.redisService.getClient();
        const data = await redis.get(uuid);

        return data ? JSON.parse(data) : {};
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async cleanup(path: string): Promise<boolean> {
        return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async clear(maxAge: number): Promise<boolean> {
        return false;
    }

    async getChunks(uuid: string): Promise<File[]> {
        return [{ uuid: uuid } as any];
    }

    private getDirPath(uuid: string): string {
        return join('chunks', uuid);
    }
}
