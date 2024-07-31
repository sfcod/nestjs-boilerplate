import { AnyEntity, EntityManager, EntityName, EntityRepository, FilterQuery, FindOptions } from '@mikro-orm/core';
import { QueryOrderMap } from '@mikro-orm/core/enums';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import * as _ from 'lodash';
import { EntityManagerResolver } from '@libs/orm-core';
import { SqlEntityManager } from '@mikro-orm/knex';
import { Knex } from 'knex';
import { JsonOutput } from '../dto/json-output';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type MapOptions<T> = {
    by: 'em' | 'dto';
};

@Injectable({ scope: Scope.REQUEST })
export class Paginator {
    constructor(
        @Inject(REQUEST) private request,
        @Inject(EntityManager) private readonly em: EntityManagerResolver,
    ) {}

    async paginate<T extends JsonOutput | AnyEntity<T>>(
        entity: EntityName<T> | T,
        query: FilterQuery<T>, // | Knex.QueryBuilder,
        sort: QueryOrderMap<T> = undefined,
        page = 1,
        limit = 20,
        filterQuery?: FindOptions<T, any> | MapOptions<T>,
    ): Promise<T[]> {
        page = page <= 0 ? 1 : page;
        limit = limit <= 0 ? 100 : limit;

        if (query['select']) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return this.paginateKnexQuery<T>(entity, query, sort, page, limit, filterQuery);
        }

        return this.paginateQueryBuilder<T>(entity as any, query as any, sort, page, limit, filterQuery as any);
    }

    async paginateQueryBuilder<T extends AnyEntity<T>>(
        entity: EntityName<T>,
        query: FilterQuery<T> = undefined,
        sort: QueryOrderMap<T> = undefined,
        page = 1,
        limit = 20,
        filterQuery: FindOptions<T> = {},
    ): Promise<T[]> {
        const isPaginationEnabled = limit > 0;

        if (isPaginationEnabled) {
            filterQuery.limit = limit;
            filterQuery.offset = (page - 1) * limit;
        }

        if (sort) {
            filterQuery.orderBy = this.removeEmptyObjects(sort);
        } else {
            // check if entity has id column
            const meta = this.em
                .getEntityManager<SqlEntityManager>(entity)
                .getMetadata()
                .find((entity as any).name);
            if (meta.properties.id) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                filterQuery.orderBy = { id: 'ASC' };
            }
        }

        const repository = this.em.getRepository(entity) as EntityRepository<T>;
        const [data, count] = await repository.findAndCount<any>(
            this.removeEmptyObjects(query || {}),
            filterQuery as any,
        );

        this.request.res.set({
            'X-Total-Count': count,
            'X-Page-Count': isPaginationEnabled ? Math.ceil(count / limit) : 1,
            'X-Current-Page': isPaginationEnabled ? page : 1,
            'X-Per-Page': isPaginationEnabled ? limit : count,
        });

        return data;
    }

    async paginateKnexQuery<T>(
        entity: T,
        query: Knex.QueryBuilder,
        sort: QueryOrderMap<T>,
        page: number,
        limit = 20,
        mapOptions: MapOptions<T> = { by: 'em' },
    ): Promise<any[]> {
        const isPaginationEnabled = limit > 0;
        const count = Number((await query.clone().clearSelect().clearOrder().count()).shift().count);

        if (isPaginationEnabled) {
            query.limit(limit);
            query.offset((page - 1) * limit);
        }

        for (const order of Object.keys(sort || {})) {
            query.orderBy(
                order.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
                sort[order] as any,
            );
        }

        this.request.res.set({
            'X-Total-Count': count,
            'X-Page-Count': isPaginationEnabled ? Math.ceil(count / limit) : 1,
            'X-Current-Page': isPaginationEnabled ? page : 1,
            'X-Per-Page': isPaginationEnabled ? limit : count,
        });

        const res: any[] = await query;
        switch (mapOptions.by) {
            case 'dto':
                return res.map((data) => Reflect.construct(entity as any, [data]));
            case 'em':
            default:
                return res.map((data) => this.em.map(entity as any, data));
        }
    }

    removeEmptyObjects(obj: any): any {
        if (obj.hasOwnProperty('_method')) {
            // obj is a QueryBuilder
            return obj;
        }

        const res = _(obj)
            .pickBy(_.isObject) // pick objects only
            .mapValues((obj) => this.removeEmptyObjects(obj)) // call only for object values
            .omitBy(_.isEmpty) // remove all empty objects
            .assign(_.omitBy(obj, _.isObject)) // assign back primitive values
            .value();

        // const finalRes = JSON.parse(JSON.stringify(res)); // It falls if there is a query builder in a `query`

        // Workaround to return an array instead of object with numeric keys
        if (obj instanceof Array) {
            return Object.values(res);
        }

        return res;
    }
}
