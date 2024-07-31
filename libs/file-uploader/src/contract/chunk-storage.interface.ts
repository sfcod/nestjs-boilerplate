import { File } from './file.interface';

export interface ChunkStorage {
    clear(maxAge: number): Promise<boolean>;

    addChunk(uuid: string, index: number, chunk: File): Promise<File>;

    assembleChunks(chunks: File[], removeChunk: boolean): Promise<File>;

    cleanup(path: string): Promise<boolean>;

    getChunks(uuid: string): Promise<File[]>;

    // loadDistribution(): boolean;
}
