import { DynamicModule, Inject, Module, Type } from '@nestjs/common';
import { StorageManager } from '@slynova/flydrive';
import { join } from 'path';
import { LocalFileSystemStorage } from './storage/local-file-system-storage';
import { path as appRoot } from 'app-root-path';
import { Mapping } from './types/entity';
import { FileHelper } from './service/file-helper';
import { OrmRemoveSubscriber } from './entity-subscriber/orm-remove.subscriber';
import { OrmUploadSubscriber } from './entity-subscriber/orm-upload.subscriber';

export const FILE_STORAGE_FILE_HELPER = 'storage_url_helper';
export const FILE_STORAGE_MAPPING = 'storage_mapping';

export type FileStorageOptions = {
    disks: any;
    mapping: {
        [key: string]: Mapping;
    };
    isGlobal?: boolean;
    entities?: Type<any>[];
};

@Module({})
export class FileStorageModule {
    constructor(
        private readonly fileHelper: FileHelper,
        @Inject('MAPPING') private readonly mapping,
        @Inject('ENTITIES') private readonly entities: Type<any>[],
    ) {
        this.entities.forEach((entity) => {
            // if (entityMeta.getFieldNames(entity.prototype).length) {
            Reflect.defineMetadata(FILE_STORAGE_FILE_HELPER, this.fileHelper, entity.prototype);
            Reflect.defineMetadata(FILE_STORAGE_MAPPING, this.mapping, entity.prototype);
            // }
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static register(options: FileStorageOptions): DynamicModule {
        options = {
            isGlobal: false,
            disks: {
                local: {
                    driver: LocalFileSystemStorage,
                    driverName: 'local',
                    config: {
                        root: join(appRoot, '/storage/entity/'),
                        host: ``,
                    },
                },
            },
            ...options,
        };

        return {
            module: FileStorageModule,
            global: options.isGlobal,
            providers: [
                {
                    provide: StorageManager,
                    useFactory: () => {
                        let disks = {};
                        for (const disk of options.disks) {
                            const { driverName, ...rest } = disk;
                            disks = {
                                ...disks,
                                ...{
                                    [driverName]: {
                                        ...rest,
                                        driver: driverName,
                                    },
                                },
                            };
                        }

                        const storageManager = new StorageManager({
                            default: 'local',
                            disks: disks,
                        });

                        for (const disk of options.disks) {
                            storageManager.registerDriver(disk.driverName, disk.driver);
                        }

                        return storageManager;
                    },
                    inject: [],
                },
                {
                    provide: 'MAPPING',
                    useValue: options.mapping || {},
                },
                {
                    provide: 'ENTITIES',
                    useValue: options.entities || [],
                },
                FileHelper,
                OrmRemoveSubscriber,
                OrmUploadSubscriber,
            ],
            exports: [StorageManager, FileHelper, 'MAPPING', 'ENTITIES'],
        };
    }
}
