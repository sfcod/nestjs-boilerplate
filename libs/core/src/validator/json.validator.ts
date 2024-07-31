import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

@Injectable()
@ValidatorConstraint({ async: true })
export class JsonConstraint implements ValidatorConstraintInterface {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async validate(value: any, args: ValidationArguments) {
        try {
            JSON.parse(value);
        } catch (e) {
            return false;
        }
        return true;
    }
}

export function Json(validationOptions?: ValidationOptions) {
    return function (object: Record<string, any>, propertyName: string) {
        registerDecorator({
            name: 'JSON',
            target: object.constructor,
            propertyName: propertyName,
            options: {
                message: 'Is not valid json',
                ...validationOptions,
            },
            constraints: [],
            validator: JsonConstraint,
        });
    };
}
