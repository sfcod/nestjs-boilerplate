import { Inject, Injectable, Type } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { MapperException } from '../exception/mapper.exception';
import { EntityManager } from '@mikro-orm/core';
import { classToPlain } from 'class-transformer';
import { Cache } from 'cache-manager';
import { MD5 } from 'object-hash';

export type MapFieldNameOrCallback<T> =
    | keyof T
    | ((data: { e: T; mapper: Mapper; extraData: Record<any, any>; em: EntityManager }) => Promise<any> | any);
export type MapFieldMetadata<U, T> = Record<keyof U, MapFieldNameOrCallback<T> | string>;
export type MapClassMetadata<T> = Type<T>;

export const MAPPER_METADATA_FIELD = 'mapperMetadataField';
export const MAPPER_METADATA_CLASS = 'mapperMetadataClass';

@Injectable()
export class Mapper {
    protected ttl: number;
    protected dependency?: (inputObject: any) => number | string;

    public constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly em: EntityManager,
    ) {}

    cache(ttl = undefined, dependency?: (inputObject: any) => number | string): this {
        this.ttl = ttl;
        this.dependency = dependency;

        return this;
    }

    async map<R, I extends Record<any, any>>(
        resultClass: Type<R>,
        inputObject: I,
        extraData?: Record<any, any>,
    ): Promise<R>;
    async map<R, I extends Record<any, any>>(
        resultClass: Type<R>,
        inputObject: I[],
        extraData?: Record<any, any>,
    ): Promise<R[]>;
    async map<R, I extends Record<any, any>>(
        resultClass: Type<R>,
        inputObject: I | I[],
        extraData?: Record<any, any>,
    ): Promise<R | R[]> {
        const result =
            this.ttl >= 0
                ? await this.cacheManager.wrap<R | R[]>(
                      `${resultClass.name}-${MD5(inputObject)}`,
                      async () => await this.format(resultClass, inputObject, extraData),
                      this.ttl,
                  )
                : await this.format(resultClass, inputObject, extraData);

        this.ttl = undefined;
        this.dependency = undefined;

        return result;
    }

    async plain(resultClass: any, inputObject: any, extraData?: Record<any, any>): Promise<any> {
        return classToPlain(await this.map(resultClass, inputObject, extraData));
    }

    public getFieldMetadata<T = any>(target: T) {
        return Reflect.getMetadata(MAPPER_METADATA_FIELD, target);
    }

    public getClassMetadata<T = any>(target: T) {
        return Reflect.getMetadata(MAPPER_METADATA_CLASS, target);
    }

    private validateClass(obj: any, type: Type) {
        if (!(obj instanceof type) && !(obj.constructor.name === 'model')) {
            throw new MapperException(
                `Invalid input object: instance of ${type.name} expected, ${obj.constructor.name} given`,
            );
        }
    }

    private async format<R, I extends Record<any, any>>(
        resultClass: Type<R>,
        inputObject: I,
        extraData?: Record<any, any>,
    ): Promise<R>;
    private async format<R, I extends Record<any, any>>(
        resultClass: Type<R>,
        inputObject: I[],
        extraData?: Record<any, any>,
    ): Promise<R[]>;
    private async format<R, I extends Record<any, any>>(
        resultClass: Type<R>,
        inputObject: I | I[],
        extraData?: Record<any, any>,
    ): Promise<R | R[]> {
        const classMetadata = this.getClassMetadata(resultClass) as MapClassMetadata<I>;
        const assign = async (obj: I) => {
            const result = Reflect.construct(resultClass, []) as R;
            const fieldMetadata = this.getFieldMetadata(result) as MapFieldMetadata<R, I>;

            for (const entry of Object.entries(fieldMetadata || {})) {
                const [resultClassKey, fieldOrCallback] = entry;
                result[resultClassKey] =
                    fieldOrCallback instanceof Function
                        ? await fieldOrCallback({ e: obj, mapper: this, extraData: extraData, em: this.em })
                        : obj[fieldOrCallback as string];
            }

            return result;
        };

        if (inputObject instanceof Array) {
            inputObject.forEach((obj) => this.validateClass(obj, classMetadata));
            return Promise.all(inputObject.map(assign));
        }

        this.validateClass(inputObject, classMetadata);

        return assign(inputObject);
    }
}
