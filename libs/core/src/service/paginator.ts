import { AnyEntity, EntityManager, EntityName, EntityRepository, FilterQuery, FindOptions } from '@mikro-orm/core';
import { QueryOrderMap } from '@mikro-orm/core/enums';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import _ from 'lodash';
import { JsonOutput } from '../dto/json-output';

@Injectable({ scope: Scope.REQUEST })
export class Paginator {
    constructor(
        @Inject(REQUEST) private request,
        private readonly em: EntityManager,
    ) {}

    async paginate<T extends JsonOutput | AnyEntity<T>>(
        entity: EntityName<T> | T,
        query: FilterQuery<T>,
        sort: QueryOrderMap<T> = undefined,
        page = 1,
        limit = 20,
        filterQuery?: FindOptions<T, any>,
    ): Promise<T[]> {
        page = page <= 0 ? 1 : page;
        limit = limit <= 0 ? 100 : limit;

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
            const meta = this.em.getMetadata().find((entity as any).name);
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

    removeEmptyObjects(obj: any): any {
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
