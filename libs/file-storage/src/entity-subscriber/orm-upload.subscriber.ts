import { EntityManager, EventArgs, EventSubscriber } from '@mikro-orm/core';
import { entityMeta } from '../service/entity-meta';
import { AnyEntity, EntityFieldMap, Mapping } from '../types/entity';
import { FileHelper } from '../service/file-helper';
import { StorageManager } from '@slynova/flydrive';
import { Inject, Injectable } from '@nestjs/common';
import { createReadStream } from 'fs';
import * as del from 'del';

@Injectable()
export class OrmUploadSubscriber implements EventSubscriber<any> {
    private readonly entityMeta = entityMeta;

    constructor(
        private readonly em: EntityManager,
        private readonly fileHelper: FileHelper,
        private readonly storageManager: StorageManager,
        @Inject('MAPPING') private mapping,
    ) {
        em.getEventManager().registerSubscriber(this);
    }

    async beforeCreate?(args: EventArgs<any>): Promise<void> {
        await this.saveFileToProperty(args.entity, true);
    }

    async afterCreate?(args: EventArgs<any>): Promise<void> {
        await this.moveFileOnStorage(args.entity);
    }

    async beforeUpdate?(args: EventArgs<any>): Promise<void> {
        await this.saveFileToProperty(args.entity, false);
    }

    async afterUpdate?(args: EventArgs<any>): Promise<void> {
        await this.moveFileOnStorage(args.entity);
    }

    protected async saveFileToProperty(entity: AnyEntity, isNew: boolean) {
        const fields: string[] = this.entityMeta.getFieldNames(entity);
        for (const fieldName of fields) {
            if (entity[fieldName] && 'originalname' in entity[fieldName]) {
                // @todo Add multer file
                const file: any = entity[fieldName];
                const item: EntityFieldMap = this.entityMeta.getFieldMap(entity, fieldName);
                const mapping: Mapping = this.mapping[item.mapping];

                // Remove old file before save new one
                if (!isNew) {
                    const filePath: string | undefined = await this.fileHelper.getPath(entity, fieldName);
                    filePath && (await this.storageManager.disk(mapping.driver).delete(filePath));
                }

                entity[item.fileNameProperty] = await this.fileHelper.getName(entity, fieldName);
                if (item.mimeTypeProperty) {
                    entity[item.mimeTypeProperty] = file.mimetype;
                }
                if (item.filePathProperty) {
                    entity[item.filePathProperty] = await this.fileHelper.getPath(entity, fieldName);
                }
            }
        }
    }

    protected async moveFileOnStorage(entity: AnyEntity) {
        const fields: string[] = this.entityMeta.getFieldNames(entity);

        for (const fieldName of fields) {
            if (entity[fieldName] && 'originalname' in entity[fieldName]) {
                // @todo Add multer file
                const file: any = entity[fieldName];
                const item: EntityFieldMap = this.entityMeta.getFieldMap(entity, fieldName);
                const filePath: string | undefined = await this.fileHelper.getPath(entity, fieldName);

                if (filePath === undefined) {
                    return;
                }

                // Reset field
                entity[fieldName] = undefined;
                const mapping: Mapping = this.mapping[item.mapping];
                if (file.move) {
                    await file.move(this.storageManager.disk(mapping.driver), filePath, file);
                } else if (file.stream) {
                    await this.storageManager.disk(mapping.driver).put(filePath, file.stream);
                } else if (file.path) {
                    await this.storageManager.disk(mapping.driver).put(filePath, createReadStream(file.path));
                    await del(file.path);
                } else if (file.buffer) {
                    await this.storageManager.disk(mapping.driver).put(filePath, file.buffer);
                } else {
                    throw new Error('Can not put file. At least one of "stream", "path", "buffer" should be provided.');
                }
            }
        }
    }
}
