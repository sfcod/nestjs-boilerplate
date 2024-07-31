import { QueryBuilder } from '@mikro-orm/knex';
import { EntityMetadata } from '@mikro-orm/core/typings';

/**
 * Wrap your query builder with this function to apply default filters assigned to entity.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function applyFilters<T extends object>(qb: QueryBuilder<T>, selectedFilters?: string[]): QueryBuilder<T> {
    const entityMetadata = (qb as any).metadata.find((qb as any)._helper.entityName) as EntityMetadata<T>;
    let where = {};

    Object.entries(entityMetadata.filters)
        .filter(([name, filter]) => {
            const isAppliable = filter.default && typeof filter.cond === 'object';
            if (!selectedFilters) return isAppliable;

            return selectedFilters.includes(name) && isAppliable;
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .forEach(([name, filter]) => {
            where = { ...where, ...(filter.cond as Record<any, any>) };
        });

    qb.andWhere(where);

    return qb;
}
