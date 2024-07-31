import { AnyEntity, EntityClass } from '@mikro-orm/core/typings';

export const RELATED_TO_ONE_METADATA_FIELD = 'relatedToOne';

export type TargetEntity<T> = EntityClass<T> | EntityClass<T>[];

type Options<TE> = {
    // connection: EntityClass<TE>;
    entity: ((entity: any) => TargetEntity<TE>) | TargetEntity<TE>;
};

export type RelatedToOneMetadata = Record<string, Options<any>>;

export function RelatedToOne<TE extends AnyEntity = AnyEntity>(opts: Options<TE>) {
    return function (target: any, propertyKey: string) {
        const prevMetadata = Reflect.getMetadata(RELATED_TO_ONE_METADATA_FIELD, target) as RelatedToOneMetadata;
        Reflect.defineMetadata(RELATED_TO_ONE_METADATA_FIELD, { ...prevMetadata, [propertyKey]: opts }, target);
    };
}
