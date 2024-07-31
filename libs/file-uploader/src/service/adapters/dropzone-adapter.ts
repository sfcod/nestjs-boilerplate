import { AbstractChunkAdapter } from './abstract-chunk-adapter';
import { Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChunkManager } from '../chunk-manager';
import { MulterFile } from '../../contract/multer-file.interface';
import { ValidationException } from '../../exception/validation.exception';
import { FileValidator } from '../../contract/file-validator.interface';
import { UploadException } from '../../exception/upload.exception';
import { ParseChunkedRequest } from '../../contract/parse-chunked-request.type';
import { ChunkValidator } from '../../contract/chunk-validator.interface';

@Injectable()
export class DropzoneAdapter extends AbstractChunkAdapter {
    constructor(
        @Inject('FileValidator') protected readonly fileValidator: FileValidator,
        @Inject('ChunkValidator') protected readonly chunkValidator: ChunkValidator,
        protected readonly eventEmitter: EventEmitter2,
        protected readonly chunkManager: ChunkManager,
    ) {
        super(fileValidator, chunkValidator, eventEmitter, chunkManager);
    }

    async upload(
        file: MulterFile,
        request: Request,
        eventType?: string,
    ): Promise<{
        uploaded: any[] | undefined;
        error: string | undefined;
    }> {
        const chunked = undefined !== request.body.dzchunkindex && request.body.dztotalchunkcount > 1;

        try {
            const result = chunked
                ? await this.handleChunkedUpload(file, request, eventType)
                : await this.handleUpload(file, request, eventType);
            return { uploaded: result || [], error: undefined };
        } catch (e) {
            if (e instanceof ValidationException || e instanceof UploadException) {
                return { uploaded: undefined, error: e.message };
            }

            throw e;
        }
    }

    protected parseChunkedRequest(request: Request): ParseChunkedRequest {
        const totalChunkCount = parseInt(request.body.dztotalchunkcount, 10);
        const index = parseInt(request.body.dzchunkindex, 10);
        const last = totalChunkCount === index + 1;
        const uuid = request.body.dzuuid;
        return {
            uuid,
            last,
            index,
        };
    }
}
