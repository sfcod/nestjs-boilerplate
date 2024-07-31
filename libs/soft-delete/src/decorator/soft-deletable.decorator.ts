import { MetadataStorage, Utils } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/core';

export type SoftDeletableOptions = {
    fieldName: string;
    hardDelete: ((entity: any, entityManager: EntityManager) => Promise<boolean>) | boolean;
    // dateFormat: string;
};

export const SOFT_DELETABLE_OPTIONS = 'softDeletableOptions';
export const SOFT_DELETABLE_QUERY_FILTER = 'softDeletableQueryFilter';

const defaultOptions = {
    fieldName: 'deletedAt',
    groupName: 'deletedId',
    hardDelete: false,
    // dateFormat: 'YYYY-MM-DD HH:mm:ss',
};

export function SoftDeletable<T extends Partial<SoftDeletableOptions>, U = any>(decoratorOptions: T = {} as T) {
    return function (target: U) {
        const options = { ...defaultOptions, ...decoratorOptions };
        Reflect.defineMetadata(SOFT_DELETABLE_OPTIONS, options, (target as any).prototype);

        const entityMetadata = MetadataStorage.getMetadataFromDecorator(target);
        entityMetadata.filters[SOFT_DELETABLE_QUERY_FILTER] = {
            name: SOFT_DELETABLE_QUERY_FILTER,
            cond: { [options.fieldName]: null },
            default: true,
            entity: Utils.asArray(target).map((n) => Utils.className(n as any)),
        };
    };
}
