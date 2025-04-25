import { Injectable } from '@nestjs/common';
import { CountOptions, FindOptions } from '@mikro-orm/core/drivers/IDatabaseDriver';
import {
    AnyEntity,
    AssignOptions,
    DeleteOptions,
    EntityData,
    EntityRepository,
    EventSubscriber,
    FindOneOrFailOptions,
    GetRepository,
    Ref,
    Primary,
    Reference,
    UpdateOptions,
} from '@mikro-orm/core';
import { EntityName, FilterQuery, Loaded, New } from '@mikro-orm/core/typings';
import { QueryOrderMap } from '@mikro-orm/core/enums';
import { OrmResolver } from './orm-resolver';
import { Transaction } from '@mikro-orm/core/connections';

export interface GetReferenceOptions {
    wrapped?: boolean;
    convertCustomTypes?: boolean;
    schema?: string;
}

@Injectable()
export class EntityManagerResolver {
    constructor(protected ormResolver: OrmResolver) {}

    getEntityManager<T = any>(connectionName: string | EntityName<any>): T {
        if (typeof connectionName === 'string') {
            return this.ormResolver.emByConnectionName(connectionName);
        }

        return this.ormResolver.em(connectionName);
    }

    /**
     * Gets a reference to the entity identified by the given type and identifier without actually loading it, if the entity is not yet loaded
     */
    getReference<T extends AnyEntity<T>>(
        entityName: EntityName<T>,
        id: Primary<T>,
        options: Omit<GetReferenceOptions, 'wrapped'> & { wrapped: true },
    ): Ref<T>;

    /**
     * Gets a reference to the entity identified by the given type and identifier without actually loading it, if the entity is not yet loaded
     */
    getReference<T extends AnyEntity<T>>(entityName: EntityName<T>, id: Primary<T> | Primary<T>[]): T;

    /**
     * Gets a reference to the entity identified by the given type and identifier without actually loading it, if the entity is not yet loaded
     */
    getReference<T extends AnyEntity<T>>(
        entityName: EntityName<T>,
        id: Primary<T>,
        options: Omit<GetReferenceOptions, 'wrapped'> & { wrapped: false },
    ): T;

    /**
     * Gets a reference to the entity identified by the given type and identifier without actually loading it, if the entity is not yet loaded
     */
    getReference<T extends AnyEntity<T>>(
        entityName: EntityName<T>,
        id: Primary<T>,
        options?: GetReferenceOptions,
    ): T | Reference<T>;

    /**
     * Gets a reference to the entity identified by the given type and identifier without actually loading it, if the entity is not yet loaded
     */
    getReference<T extends AnyEntity<T>>(
        entityName: EntityName<T>,
        id: Primary<T>,
        options: GetReferenceOptions = {},
    ): T | Ref<T> | Reference<T> {
        return this.ormResolver.em(entityName).getReference(entityName, id, options);
    }

    // aggregate(entityName: EntityName<T>, pipeline: any[]): Promise<any[]> {
    //     return this.ormResolver.orm(entityName).em.aggregate(entityName, pipeline);
    // }

    getEventManager() {
        const connections = this.ormResolver.getConnections();

        return {
            registerSubscriber: (subscriber: EventSubscriber): void => {
                for (const connection of connections) {
                    if (
                        subscriber.getSubscribedEntities &&
                        // @ts-ignore
                        connection.config.get('entities').includes(subscriber.getSubscribedEntities().pop())
                    ) {
                        connection.em.getEventManager().registerSubscriber(subscriber);
                        break;
                    } else {
                        connection.em.getEventManager().registerSubscriber(subscriber);
                    }
                }
            },
        };
    }

    getRepository<T extends AnyEntity<T>, U extends EntityRepository<T>>(
        entityName: EntityName<T>,
    ): GetRepository<T, U> {
        return this.ormResolver.em(entityName).getRepository(entityName);
    }

    /**
     * Creates new instance of given entity and populates it with given data
     */
    create<T extends AnyEntity<T>, P extends string = never>(
        entityName: EntityName<T>,
        data: EntityData<T>,
        options?: { managed?: boolean },
    ): New<T, P> {
        return this.ormResolver.em(entityName).create(entityName, data, options);
    }

    /**
     * Shortcut for `wrap(entity).assign(data, { em })`
     */
    assign<T extends AnyEntity<T>, Convert extends boolean>(
        entity: T,
        data: EntityData<T>,
        options?: AssignOptions<Convert>,
    ): T {
        return this.ormResolver.em(entity as any).assign(entity, data, options);
    }

    count<T extends AnyEntity<T>>(
        entityName: EntityName<T>,
        where?: FilterQuery<T>,
        options?: CountOptions<T>,
    ): Promise<number> {
        return this.ormResolver.em(entityName).count(entityName as any, where, options);
    }

    // createEntityManager<D = IDatabaseDriver extends IDatabaseDriver>(useContext?: boolean): D[typeof EntityManagerType] {
    //     return undefined;
    // }

    // ensureIndexes(): Promise<void> {
    //     return Promise.resolve(undefined);
    // }
    /**
     * Finds all entities matching your `where` query. You can pass additional options via the `options` parameter.
     */
    find<T extends AnyEntity<T>, P extends string = never>(
        entityName: EntityName<T>,
        where: FilterQuery<T>,
        options?: FindOptions<T, P>,
    ): Promise<Loaded<T, P>[]>;
    /**
     * Finds all entities matching your `where` query.
     */
    find<T extends AnyEntity<T>, P extends string = never>(
        entityName: EntityName<T>,
        where: FilterQuery<T>,
        populate?: P,
        orderBy?: QueryOrderMap<T>,
        limit?: number,
        offset?: number,
    ): Promise<Loaded<T, P>[]> {
        return this.ormResolver.em(entityName).find(entityName, where, populate, orderBy, limit, offset);
    }

    /**
     * Finds first entity matching your `where` query. If nothing found, it will throw an error.
     * You can override the factory for creating this method via `options.failHandler` locally
     * or via `Configuration.findOneOrFailHandler` globally.
     */
    findOneOrFail<T extends AnyEntity<T>, P extends string = never>(
        entityName: EntityName<T>,
        where: FilterQuery<T>,
        options?: FindOneOrFailOptions<T, P>,
        orderBy?: QueryOrderMap<T>,
    ): Promise<Loaded<T, P>> {
        return this.ormResolver.em(entityName).findOneOrFail(entityName, where, options, orderBy);
    }

    findOne<T extends AnyEntity<T>, P extends string = never>(
        entityName: EntityName<T>,
        where: FilterQuery<T>,
        options?: FindOptions<T, P>,
        orderBy?: QueryOrderMap<T>,
    ): Promise<Loaded<T, P> | null> {
        return this.ormResolver.em(entityName).findOne(entityName, where, options, orderBy);
    }

    /**
     * Calls `em.find()` and `em.count()` with the same arguments (where applicable) and returns the results as tuple
     * where first element is the array of entities and the second is the count.
     */
    findAndCount<T extends AnyEntity<T>, P extends string = never>(
        entityName: EntityName<T>,
        where: FilterQuery<T>,
        options?: FindOptions<T, P>,
    ): Promise<[Loaded<T, P>[], number]>;
    /**
     * Calls `em.find()` and `em.count()` with the same arguments (where applicable) and returns the results as tuple
     * where first element is the array of entities and the second is the count.
     */
    findAndCount<T extends AnyEntity<T>, P extends string = never>(
        entityName: EntityName<T>,
        where: FilterQuery<T>,
        populate?: P,
        orderBy?: QueryOrderMap<T>,
        limit?: number,
        offset?: number,
    ): Promise<[Loaded<T, P>[], number]> {
        return this.ormResolver.em(entityName).findAndCount(entityName, where, populate, orderBy, limit, offset);
    }

    /**
     * Starts new transaction bound to this EntityManager. Use `ctx` parameter to provide the parent when nesting transactions.
     */
    async begin(ctx?: Transaction): Promise<void> {
        for (const connection of this.ormResolver.getConnections()) {
            await connection.em.begin(ctx);
        }
    }

    /**
     * Commits the transaction bound to this EntityManager. Flushes before doing the actual commit query.
     */
    async commit(): Promise<void> {
        for (const connection of this.ormResolver.getConnections()) {
            await connection.em.commit();
        }
    }

    /**
     * Rollbacks the transaction bound to this EntityManager.
     */
    async rollback(): Promise<void> {
        for (const connection of this.ormResolver.getConnections()) {
            await connection.em.rollback();
        }
    }

    nativeDelete<T extends AnyEntity<T>>(
        entityName: EntityName<T>,
        where: FilterQuery<T>,
        options?: DeleteOptions<T>,
    ): Promise<number> {
        return this.ormResolver.em(entityName).nativeDelete(entityName, where, options);
    }

    nativeInsert<T extends AnyEntity<T>>(entityName: EntityName<T>, data: EntityData<T>): Promise<Primary<T>> {
        return this.ormResolver.em(entityName).nativeInsert(entityName, data);
    }

    // nativeInsertMany<T extends AnyEntity<T>>(
    //     entityName: string,
    //     data: EntityData<T>[],
    //     ctx?: Transaction,
    //     processCollections?: boolean,
    //     convertCustomTypes?: boolean,
    // ): Promise<QueryResult> {
    //     return this.ormResolver.em(entityName).nativeInsertMany(entityName, data);
    // }

    nativeUpdate<T extends AnyEntity<T>>(
        entityName: EntityName<T>,
        where: FilterQuery<T>,
        data: EntityData<T>,
        options?: UpdateOptions<T>,
    ): Promise<number> {
        return this.ormResolver.em(entityName).nativeUpdate(entityName, where, data, options);
    }

    // nativeUpdateMany<T extends AnyEntity<T>>(
    //     entityName: string,
    //     where: FilterQuery<T>[],
    //     data: EntityData<T>[],
    //     ctx?: Transaction,
    //     processCollections?: boolean,
    //     convertCustomTypes?: boolean,
    // ): Promise<QueryResult> {
    //     return Promise.resolve(undefined);
    // }

    // reconnect(): Promise<Connection> {
    //     return Promise.resolve(undefined);
    // }

    // setMetadata(metadata: MetadataStorage): void {
    // }

    // syncCollection<T, O>(collection: Collection<T, O>, ctx?: Transaction): Promise<void> {
    //     return Promise.resolve(undefined);
    // }

    /**
     * Maps raw database result to an entity and merges it to this EntityManager.
     */
    map<T extends AnyEntity<T>>(entityName: EntityName<T>, result: EntityData<T>): T {
        return this.ormResolver.em(entityName).map(entityName, result);
    }

    /**
     * Tells the EntityManager to make an instance managed and persistent.
     * The entity will be entered into the database at or before transaction commit or as a result of the flush operation.
     */
    persist(entity: AnyEntity | Reference<AnyEntity> | (AnyEntity | Reference<AnyEntity>)[]): this {
        const entities = entity instanceof Array ? entity : [entity];
        for (const e of entities) {
            const entity = (e instanceof Reference ? e.getEntity() : e) as EntityName<any>;
            this.ormResolver.em(entity).persist(e);
        }

        return this;
    }

    /**
     * Persists your entity immediately, flushing all not yet persisted changes to the database too.
     * Equivalent to `em.persist(e).flush()`.
     */
    async persistAndFlush(
        entity: AnyEntity | Reference<AnyEntity> | (AnyEntity | Reference<AnyEntity>)[],
    ): Promise<void> {
        const entities = entity instanceof Array ? entity : [entity];
        const byConnections = this.groupEntitiesByConnection(entities);
        for (const connection in byConnections) {
            this.ormResolver.emByConnectionName(connection).persist(byConnections[connection]);
        }

        await this.flush();
    }

    /**
     * Marks entity for removal.
     * A removed entity will be removed from the database at or before transaction commit or as a result of the flush operation.
     *
     * To remove entities by condition, use `em.nativeDelete()`.
     */
    remove<T extends AnyEntity<T>>(entity: T | Reference<T> | (T | Reference<T>)[]): this {
        const entities = entity instanceof Array ? entity : [entity];
        for (const e of entities) {
            const entity = (e instanceof Reference ? e.getEntity() : e) as unknown as EntityName<any>;
            this.ormResolver.em(entity).remove(e);
        }

        return this;
    }

    /**
     * Removes an entity instance immediately, flushing all not yet persisted changes to the database too.
     * Equivalent to `em.remove(e).flush()`
     */
    async removeAndFlush(entity: AnyEntity | Reference<AnyEntity>): Promise<void> {
        const entities = entity instanceof Array ? entity : [entity];
        const byConnections = this.groupEntitiesByConnection(entities);

        for (const connection in byConnections) {
            this.ormResolver.emByConnectionName(connection).remove(byConnections[connection]);
        }

        await this.flush();
    }

    /**
     * Flushes all changes to objects that have been queued up to now to the database.
     * This effectively synchronizes the in-memory state of managed objects with the database.
     */
    async flush(): Promise<void> {
        for (const connection of this.ormResolver.getConnections()) {
            await connection.em.flush();
        }
    }

    /**
     * Clears the EntityManager. All entities that are currently managed by this EntityManager become detached.
     */
    clear(): void {
        for (const connection of this.ormResolver.getConnections()) {
            connection.em.clear();
        }
    }

    private groupEntitiesByConnection(entities: AnyEntity[]): { [connection: string]: Array<EntityName<any>> } {
        const byConnections: { [connection: string]: Array<EntityName<any>> } = {};
        for (const e of entities) {
            const entity = (e instanceof Reference ? e.getEntity() : e) as EntityName<any>;
            const connectionName = this.ormResolver.getConnectionName(entity);

            byConnections[connectionName] = [...(byConnections[connectionName] || []), entity];
        }

        return byConnections;
    }
}
