import { File } from '../contract/file.interface';
import { Inject, Injectable } from '@nestjs/common';
import { ChunkStorage } from '../contract/chunk-storage.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChunkManager {
    constructor(
        @Inject('ChunkStorage') private readonly chunkStorage: ChunkStorage,
        private readonly config: ConfigService,
    ) {}

    clear(): Promise<boolean> {
        return this.chunkStorage.clear(this.config.get('FILE_UPLOADER_CHUNK_MAX_AGE', 8600));
    }

    addChunk(uuid: string, index: number, chunk: File): Promise<File> {
        return this.chunkStorage.addChunk(uuid, index, chunk);
    }

    assembleChunks(chunks: File[], removeChunk = true): Promise<File> {
        return this.chunkStorage.assembleChunks(chunks, removeChunk);
    }

    cleanup(path: string): Promise<boolean> {
        return this.chunkStorage.cleanup(path);
    }

    getChunks(uuid: string): Promise<File[]> {
        return this.chunkStorage.getChunks(uuid);
    }
}
