import { QueryOrderKeys, QueryOrderMap } from '@mikro-orm/core';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export abstract class Sortable<T = any> implements QueryOrderMap<any> {
    public static readonly NAME_PREFIX = 'sort';

    public static prefix(name: string): string {
        return `${Sortable.NAME_PREFIX}[${name}]`;
    }

    [x: string]: QueryOrderKeys<T>;
}
