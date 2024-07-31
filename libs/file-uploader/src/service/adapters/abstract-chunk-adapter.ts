import { AbstractAdapter } from './abstract-adapter';
import { Request } from 'express';
import { File } from '../../contract/file.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChunkManager } from '../chunk-manager';
import { MulterFile } from '../../contract/multer-file.interface';
import { FileValidator } from '../../contract/file-validator.interface';
import { ValidationException } from '../../exception/validation.exception';
import { ParseChunkedRequest } from '../../contract/parse-chunked-request.type';
import { ChunkValidator } from '../../contract/chunk-validator.interface';

export abstract class AbstractChunkAdapter extends AbstractAdapter {
    protected constructor(
        protected readonly fileValidator: FileValidator,
        protected readonly chunkValidator: ChunkValidator,
        protected readonly eventEmitter: EventEmitter2,
        protected readonly chunkManager: ChunkManager,
    ) {
        super(fileValidator, eventEmitter);
    }

    public abstract upload(
        file: File,
        request: Request,
        eventType?: string,
    ): Promise<{ uploaded: any[] | undefined; error: string | undefined }>;

    /**
     *  Parses a chunked request and return relevant information.
     */
    protected abstract parseChunkedRequest(request: Request): ParseChunkedRequest;

    /**
     *  This function will be called in order to upload and save an
     *  uploaded chunk.
     */
    protected async handleChunkedUpload(file: MulterFile, request: Request, eventType?: string): Promise<any[] | null> {
        const chunkedRequest = this.parseChunkedRequest(request);
        const { index, last, uuid } = chunkedRequest;
        const isDev = process.env.NODE_ENV === 'development';

        const error = await this.chunkValidator.validate(file, chunkedRequest, eventType);
        if (error) {
            throw new ValidationException(error);
        }
        isDev && console.time(`upload-chunk-${uuid}-${index}`);
        await this.chunkManager.addChunk(uuid, index, file);
        isDev && console.timeEnd(`upload-chunk-${uuid}-${index}`);
        if (last) {
            isDev && console.time(`assemble-chunk-${uuid}-${index}`);
            const chunks = await this.chunkManager.getChunks(uuid);
            const assembled = await this.chunkManager.assembleChunks(chunks, true);
            const result = await this.handleUpload(assembled, request, eventType);
            isDev && console.timeEnd(`assemble-chunk-${uuid}-${index}`);

            return result;
        }
    }
}
