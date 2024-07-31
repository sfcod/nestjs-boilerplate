import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';

@Injectable()
@ValidatorConstraint({ async: true })
export class CallbackConstraint implements ValidatorConstraintInterface {
    constructor(private readonly em: EntityManager) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async validate(value: any, args: ValidationArguments) {
        const [callback] = args.constraints;
        return await callback({ value, object: args.object, em: this.em });
    }
}

export function Callback<T = any, V = any>(
    callback: (args: { object: T; value: V; em: EntityManager }) => boolean | Promise<boolean>,
    validationOptions?: ValidationOptions,
) {
    return function (object: Record<string, any>, propertyName: string) {
        registerDecorator({
            name: 'Callback',
            target: object.constructor,
            propertyName: propertyName,
            options: {
                message: 'Property is not valid',
                ...validationOptions,
            },
            constraints: [callback],
            validator: CallbackConstraint,
        });
    };
}
