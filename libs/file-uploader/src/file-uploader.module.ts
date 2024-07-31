import { DynamicModule, ExistingProvider, FactoryProvider, Module, Type } from '@nestjs/common';
import { FilesystemChunkStorage } from './service/filesystem-chunk-storage';
import { MulterModule } from '@nestjs/platform-express';
import { path as appRoot } from 'app-root-path';
import { join } from 'path';
import { DropzoneAdapter } from './service/adapters/dropzone-adapter';
import { MulterModuleOptions } from '@nestjs/platform-express/multer/interfaces/files-upload-module.interface';
import { ChunkManager } from './service/chunk-manager';
// import { ClearChunkCommand } from './command/clear-chunk.command';
import { ChunkStorage } from './contract/chunk-storage.interface';
import { AbstractChunkAdapter } from './service/adapters/abstract-chunk-adapter';
import { FilesystemValidator } from './service/filesystem-validator';
import { FileValidator } from './contract/file-validator.interface';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { FilesystemChunkValidator } from './service/filesystem-chunk-validator';

export interface UploaderOptions extends Pick<ModuleMetadata, 'imports'> {
    isGlobal?: boolean;
    uploader?:
        | Omit<Type<AbstractChunkAdapter>, 'provide'>
        | Omit<FactoryProvider<AbstractChunkAdapter>, 'provide'>
        | Omit<ExistingProvider<AbstractChunkAdapter>, 'provide'>;
    fileValidator?:
        | Omit<Type<FileValidator>, 'provide'>
        | Omit<FactoryProvider<FileValidator>, 'provide'>
        | Omit<ExistingProvider<FileValidator>, 'provide'>;
    chunkStorage?:
        | Omit<Type<ChunkStorage>, 'provide'>
        | Omit<FactoryProvider<ChunkStorage>, 'provide'>
        | Omit<ExistingProvider<ChunkStorage>, 'provide'>;
    chunkValidator?:
        | Omit<Type<FileValidator>, 'provide'>
        | Omit<FactoryProvider<FileValidator>, 'provide'>
        | Omit<ExistingProvider<FileValidator>, 'provide'>;
    maxSize?: { [eventType: string]: number[] };
    minSize?: { [eventType: string]: number[] };
    maxChunkSize?: { [eventType: string]: number[] };
    minChunkSize?: { [eventType: string]: number[] };
    allowedMimetypes?: { [eventType: string]: string[] };
    multerTmpPath?: string;
    multerOptions?: MulterModuleOptions;
    allowedFormats?: { [eventType: string]: string[] };
}

@Module({})
export class FileUploaderModule {
    static register(options: UploaderOptions = {}): DynamicModule {
        options = {
            isGlobal: false,
            multerTmpPath: join(appRoot, '/storage/tmp'),
            uploader: DropzoneAdapter,
            fileValidator: FilesystemValidator,
            chunkStorage: FilesystemChunkStorage,
            chunkValidator: FilesystemChunkValidator,
            allowedMimetypes: {},
            maxSize: {},
            minSize: {},
            minChunkSize: {},
            maxChunkSize: {},
            allowedFormats: {},
            ...options,
        };
        const multerModule = MulterModule.registerAsync({
            useFactory: () => options.multerOptions || { dest: options.multerTmpPath },
        });

        return {
            global: options.isGlobal,
            module: FileUploaderModule,
            imports: [...(options.imports ?? []), multerModule],
            providers: [
                this.registerProvider<AbstractChunkAdapter>('Uploader', options.uploader),
                this.registerProvider<FileValidator>('FileValidator', options.fileValidator),
                this.registerProvider<ChunkStorage>('ChunkStorage', options.chunkStorage),
                this.registerProvider<FileValidator>('ChunkValidator', options.chunkValidator),
                {
                    provide: 'ALLOWED_MIMETYPES',
                    useValue: options.allowedMimetypes,
                },
                {
                    provide: 'MAX_SIZE',
                    useValue: options.maxSize,
                },
                {
                    provide: 'MIN_SIZE',
                    useValue: options.minSize,
                },
                {
                    provide: 'MIN_CHUNK_SIZE',
                    useValue: options.minChunkSize,
                },
                {
                    provide: 'MAX_CHUNK_SIZE',
                    useValue: options.maxChunkSize,
                },
                {
                    provide: 'ALLOWED_FORMATS',
                    useValue: options.allowedFormats,
                },
                ChunkManager,
            ],
            exports: ['Uploader', ChunkManager, multerModule],
        };
    }

    private static registerProvider<T>(
        name: string,
        provider?:
            | Omit<Type<T>, 'provide'>
            | Omit<FactoryProvider<T>, 'provide'>
            | Omit<ExistingProvider<T>, 'provide'>,
    ): any {
        if (typeof provider === 'function') {
            return {
                provide: name,
                useClass: provider,
            };
        }

        if (typeof provider === 'object') {
            return {
                ...provider,
                provide: name,
            };
        }

        throw new Error('Can not process provider');
    }
}
