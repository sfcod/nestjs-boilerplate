import { EntityFieldMap } from '../types/entity';
import { AnyEntity } from '@mikro-orm/core/typings';

export class EntityMeta {
    private readonly METADATA_KEY = 'entitystorage';

    public setFieldMap(entity: AnyEntity, fieldName: string, item: EntityFieldMap) {
        const entityScopes = Reflect.getMetadata(this.METADATA_KEY, entity) || {};

        Reflect.defineMetadata(this.METADATA_KEY, { ...entityScopes, [fieldName]: item }, entity);
    }

    public hasFieldMap(entity: AnyEntity, fieldName: string): boolean {
        const entityScopes: any = Reflect.getMetadata(this.METADATA_KEY, entity) || {};

        return !!(fieldName && entityScopes[fieldName]);
    }

    public getFieldMap(entity: AnyEntity, fieldName: string): EntityFieldMap {
        const entityScopes: any = Reflect.getMetadata(this.METADATA_KEY, entity) || {};

        if (fieldName && entityScopes[fieldName]) {
            return entityScopes[fieldName];
        }

        throw new Error(`Entity "${entity.constructor.name}" does not have mapped field "${fieldName}"`);
    }

    public getFieldNames(entity: AnyEntity): string[] {
        const entityScopes: any = Reflect.getMetadata(this.METADATA_KEY, entity) || {};

        return Object.keys(entityScopes);
    }
}

export const entityMeta = new EntityMeta();
