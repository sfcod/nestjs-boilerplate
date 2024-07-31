import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { CountOptions, EntityName } from '@mikro-orm/core';
import { SOFT_DELETABLE_QUERY_FILTER } from '@libs/soft-delete';
import { OrmResolver } from '@libs/orm-core';

@Injectable()
@ValidatorConstraint({ async: true })
export class UniqueEntityConstraint implements ValidatorConstraintInterface {
    constructor(private readonly resolver: OrmResolver) {}

    async validate(value: any, args: ValidationArguments) {
        const [fields, target, filters, caseSensitive] = args.constraints;

        let query = {};
        fields.forEach((field: string) => {
            query = caseSensitive
                ? { ...query, [field]: (args.object as any)[field] }
                : {
                      ...query,
                      [`lower(${field})`]: String((args.object as any)[field])?.toLowerCase(),
                  };
        });
        if ((args.object as any).id) {
            query = { ...query, 'id:ne': (args.object as any).id };
        }
        const count = await this.resolver
            .em(target)
            .fork()
            .count(target, query, {
                filters: {
                    [SOFT_DELETABLE_QUERY_FILTER]: false,
                    ...filters,
                },
            });

        return count <= 0;
    }
}

type Options = ValidationOptions & { caseSensitive?: boolean };

export function UniqueEntity<T extends Record<any, any>>(
    fields: string[],
    target?: EntityName<T>,
    { caseSensitive = true, ...validationOptions }: Options = {},
    filters: CountOptions<T, any>['filters'] = {},
) {
    return function (object: Record<string, any>, propertyName: string) {
        registerDecorator({
            name: 'UniqueEntity',
            target: object.constructor,
            propertyName: propertyName,
            options: {
                message: 'The entity exists',
                ...validationOptions,
            },
            constraints: [fields, target ?? object.constructor, filters, caseSensitive],
            validator: UniqueEntityConstraint,
        });
    };
}
