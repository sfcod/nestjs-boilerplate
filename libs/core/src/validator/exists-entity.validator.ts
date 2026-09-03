import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions as BaseValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { EntityManager, EntityName, FilterQuery } from '@mikro-orm/core';
import { AnyEntity } from '@mikro-orm/core/typings';

type ValidationOptions<T> = BaseValidationOptions & {
    where?: FilterQuery<T>;
    filters?: Record<string, any>;
};

@Injectable()
@ValidatorConstraint({ async: true })
export class ExistsEntityConstraint implements ValidatorConstraintInterface {
    constructor(private readonly em: EntityManager) {}

    async validate(value: any, args: ValidationArguments) {
        const [fields, target, where, filters] = args.constraints;

        let query = { ...where };
        Object.keys(fields).forEach((field: string) => {
            query = { ...query, [fields[field]]: (args.object as any)[field] };
        });
        if ((args.object as any).id) {
            query = { ...query, 'id:ne': (args.object as any).id };
        }
        const entity = await this.em.fork().findOne(target, query, { filters });

        return !!entity;
    }
}

export function ExistsEntity<T extends AnyEntity<T> = AnyEntity>(
    fields: { [prop: string]: keyof T },
    target?: EntityName<T>,
    { where = undefined, filters = undefined, ...validationOptions }: ValidationOptions<T> = {},
) {
    return function (object: Record<string, any>, propertyName: string) {
        registerDecorator({
            name: 'ExistsEntity',
            target: object.constructor,
            propertyName: propertyName,
            options: {
                message: 'The entity does not exist',
                ...validationOptions,
            },
            constraints: [fields, target ?? object.constructor, where, filters],
            validator: ExistsEntityConstraint,
        });
    };
}
