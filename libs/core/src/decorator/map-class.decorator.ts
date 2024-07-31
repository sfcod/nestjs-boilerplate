import { MAPPER_METADATA_CLASS } from '../service/mapper';
import { Abstract, Type } from '@nestjs/common';

export function MapClass<T = Record<any, any>, U = any>(className: Type<T> | Abstract<T>) {
    return function (target: U) {
        Reflect.defineMetadata(MAPPER_METADATA_CLASS, className, target);
    };
}
