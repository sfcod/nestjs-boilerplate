import { ObjectHydrator as HydratorBase } from '@mikro-orm/core';
import { AnyEntity, EntityData, EntityMetadata } from '@mikro-orm/core/typings';
import { EntityFactory } from '@mikro-orm/core/entity';

export class PostgreSqlHydrator extends HydratorBase {
    /**
     * @inheritDoc
     */
    hydrate<T extends AnyEntity<T>>(
        entity: T,
        meta: EntityMetadata<T>,
        data: EntityData<T>,
        factory: EntityFactory,
        type: 'full' | 'reference',
        newEntity?: boolean,
        // convertCustomTypes?: boolean,
    ): void {
        super.hydrate(entity, meta, data, factory, type, newEntity, true);
    }

    /**
     * @inheritDoc
     */
    hydrateReference<T extends AnyEntity<T>>(
        entity: T,
        meta: EntityMetadata<T>,
        data: EntityData<T>,
        factory: EntityFactory,
        // convertCustomTypes?: boolean,
    ): void {
        super.hydrateReference(entity, meta, data, factory, true);
    }
}
