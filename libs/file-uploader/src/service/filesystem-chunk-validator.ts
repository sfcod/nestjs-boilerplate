import { File } from '../contract/file.interface';
import { Inject, Injectable } from '@nestjs/common';
import { ChunkValidator } from '../contract/chunk-validator.interface';
import { ParseChunkedRequest } from '../contract/parse-chunked-request.type';

const MIN_SIZE_10mb = 10485760;

@Injectable()
export class FilesystemChunkValidator implements ChunkValidator {
    public constructor(
        @Inject('MAX_CHUNK_SIZE') protected readonly maxChunkSize,
        @Inject('MIN_CHUNK_SIZE') protected readonly minChunkSize,
    ) {}

    async validate(file: File, request: ParseChunkedRequest, eventType?: string): Promise<string | null> {
        if (eventType && this.maxChunkSize[eventType]) {
            if (file.size > this.maxChunkSize[eventType]) {
                return `Max chunk size is ${this.maxChunkSize[eventType]} bytes.`;
            }
        }

        if (false === request.last) {
            if (eventType && this.minChunkSize[eventType]) {
                if (file.size < this.minChunkSize[eventType]) {
                    return `Min chunk size is ${this.minChunkSize[eventType]} bytes.`;
                }
            }
            // Default condition
            else if (file.size < MIN_SIZE_10mb) {
                return `Min chunk size is ${MIN_SIZE_10mb} bytes.`;
            }
        }
        return null;
    }
}
