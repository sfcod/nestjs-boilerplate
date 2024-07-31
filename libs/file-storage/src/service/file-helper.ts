import { SignedUrlOptions, StorageManager } from '@slynova/flydrive';
import { DirectoryNamerInterface } from '../naming/directory-namer.interface';
import { snakeCase } from 'lodash';
import { join } from 'path';
import { Inject, Injectable } from '@nestjs/common';
import { entityMeta } from './entity-meta';
import { EntityFieldMap, Mapping } from '../types/entity';
import { AnyEntity } from '@mikro-orm/core/typings';
import { FileNamerInterface } from '../naming/file-namer.interface';
import Storage from '@slynova/flydrive/build/Storage';

@Injectable()
export class FileHelper {
    private readonly entityMeta = entityMeta;

    constructor(
        private readonly storageManager: StorageManager,
        @Inject('MAPPING') private mapping,
    ) {}

    /**
     * @param entity
     * @param fieldName
     * @param signed
     * @param options
     */
    public async getUrl(
        entity: AnyEntity,
        fieldName: string,
        signed?,
        options?: SignedUrlOptions,
    ): Promise<string | undefined> {
        const path: string | undefined = await this.getPath(entity, fieldName);
        const mapping: Mapping = await this.getMapping(entity, fieldName);
        const { signed: defaultSigned, expiry: defaultExpiry } = mapping.options;
        const { expiry } = options || {};

        if (path === undefined) {
            return undefined;
        }

        if (signed || defaultSigned) {
            const response = await this.storageManager
                .disk(mapping.driver)
                .getSignedUrl(path, { expiry: expiry || defaultExpiry });

            return response.signedUrl;
        }

        return this.storageManager.disk(mapping.driver).getUrl(path);
    }

    public async getName(entity: AnyEntity, fieldName: string): Promise<string | undefined> {
        const mapping: Mapping = await this.getMapping(entity, fieldName);

        let fileName = '';

        if (mapping.fileNamer) {
            const namer: FileNamerInterface = Reflect.construct(mapping.fileNamer, [entity, entity[fieldName]]);
            fileName = await namer.fileName(entity, entity[fieldName]);
        } else {
            fileName = entity[fieldName].originalname;
        }

        return fileName;
    }

    public async getPath(entity: AnyEntity, fieldName: string): Promise<string | undefined> {
        const fieldMap: EntityFieldMap = this.entityMeta.getFieldMap(entity, fieldName);

        if (!entity[fieldMap.fileNameProperty]) {
            return undefined;
        }

        return join(await this.getDirectoryName(entity, fieldName), '/', entity[fieldMap.fileNameProperty]);
    }

    public async getDisk(
        entity: AnyEntity,
        fieldName: string,
    ): Promise<Storage & { getUrl(location: string, uri?: boolean): string }> {
        const mapping: Mapping = await this.getMapping(entity, fieldName);

        return this.getStorage(mapping.driver);
    }

    public async getStorage(driver: string): Promise<Storage & { getUrl(location: string, uri?: boolean): string }> {
        return this.storageManager.disk(driver);
    }

    public async getMapping(entity: AnyEntity, fieldName: string): Promise<Mapping> {
        const fieldMap: EntityFieldMap = this.entityMeta.getFieldMap(entity, fieldName);
        return this.mapping[fieldMap.mapping];
    }

    private async getDirectoryName(entity: AnyEntity, fieldName: string): Promise<string> {
        const fieldMap: EntityFieldMap = this.entityMeta.getFieldMap(entity, fieldName);
        const mapping: Mapping = await this.getMapping(entity, fieldName);

        let dirName = '';

        if (mapping.directoryNamer) {
            const namer: DirectoryNamerInterface = Reflect.construct(mapping.directoryNamer, [entity, fieldMap]);
            dirName = await namer.directoryName(entity, fieldMap);
        } else {
            dirName = snakeCase(entity.constructor.name);
        }

        return join(`${mapping.prefix ? mapping.prefix : ''}`, dirName);
    }
}
