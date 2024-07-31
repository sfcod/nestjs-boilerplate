import { AnyEntity } from '@mikro-orm/core/typings';
import { MapFieldNameOrCallback, MapFieldMetadata, MAPPER_METADATA_FIELD } from '../service/mapper';

export function MapField<T = AnyEntity, U = any>(fieldNameOrCallback?: MapFieldNameOrCallback<T>) {
    return function (target: U, propertyKey: string) {
        const prevMetadata = Reflect.getMetadata(MAPPER_METADATA_FIELD, target) as MapFieldMetadata<U, T>;

        Reflect.defineMetadata(
            MAPPER_METADATA_FIELD,
            { ...prevMetadata, [propertyKey]: fieldNameOrCallback || propertyKey },
            target,
        );
    };
}
