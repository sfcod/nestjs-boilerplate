import { ChunkStorage } from '../contract/chunk-storage.interface';
import { appendFile, exists, mkdir, readdir, readFile, rename, stat } from 'fs';
import { basename, join } from 'path';
import { promisify } from 'util';
import { File } from '../contract/file.interface';
import {deleteAsync} from 'del';
import { orderBy } from 'lodash';
import { path as appRoot } from 'app-root-path';
import { ModuleRef } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { fileTypeFromFile as fromFile } from 'file-type';

const existsAsync = promisify(exists);
const renameAsync = promisify(rename);
const mkdirAsync = promisify(mkdir);
const readdirAsync = promisify(readdir);
const statAsync = promisify(stat);
const appendFileAsync = promisify(appendFile);
const readFileAsync = promisify(readFile);

@Injectable()
export class FilesystemChunkStorage implements ChunkStorage {
    private readonly directory: string = join(appRoot, process.env.FILE_SYSTEM_CHUNK_KEY || '/storage/chunks');

    constructor(protected readonly moduleRef: ModuleRef) {}

    async addChunk(uuid: string, index: number, chunk: File): Promise<File> {
        const path = this.getDirPath(uuid);
        const name = `${index.toString()}_${chunk.originalname}`;

        if (!(await existsAsync(path))) {
            await mkdirAsync(path, { recursive: true });
        }

        await renameAsync(chunk.path, join(path, name));

        chunk.path = join(path, name);
        chunk.originalname = name;

        return chunk;
    }

    async assembleChunks(chunks: File[], removeChunk: boolean): Promise<File> {
        const name = chunks[0].originalname.replace(/^(\d+)_/, '');
        const assembledFile = chunks[0].path.replace(chunks[0].originalname, name);

        for (const chunk of chunks) {
            const file = await readFileAsync(chunk.path);
            await appendFileAsync(assembledFile, file);
            if (removeChunk) {
                await deleteAsync(chunk.path);
            }
        }

        const stat = await statAsync(assembledFile);
        const fileType = await fromFile(assembledFile);

        return {
            originalname: name,
            mimetype: fileType ? fileType.mime : '',
            size: stat.size,
            path: assembledFile,
        };
    }

    async cleanup(path: string): Promise<boolean> {
        await deleteAsync(join(path, '**'));

        return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async clear(maxAge: number): Promise<boolean> {
        return false;
    }

    async getChunks(uuid: string): Promise<File[]> {
        const path = this.getDirPath(uuid);
        const list = await readdirAsync(path);
        // Filter not chunk
        const filteredList = list.filter((file: string) => {
            return !isNaN(Number(file.substr(0, file.indexOf('_'))));
        });
        const files = orderBy(
            filteredList.map((file) => {
                return {
                    file,
                    index: Number(file.substr(0, file.indexOf('_'))),
                };
            }),
            ['index'],
            ['asc'],
        );
        return Promise.all(
            files.map(async ({ file }) => {
                const filepath = join(path, file);
                const name = basename(file);
                return {
                    originalname: name,
                    filename: name.split('.').slice(0, -1).join('.'),
                    mimetype: '',
                    size: (await statAsync(filepath)).size,
                    path: filepath,
                } as File;
            }),
        );
    }

    private getDirPath(uuid: string): string {
        return join(this.directory, '/', uuid);
    }
}
