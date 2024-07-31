import {
    isObject,
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

@Injectable()
@ValidatorConstraint()
export class JsonMaxSizeConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        const [max] = args.constraints;

        return isObject(value) && Buffer.byteLength(JSON.stringify(value), 'utf8') <= max;
    }
}

export function JsonMaxSize(max: number, validationOptions?: ValidationOptions) {
    return function (object: Record<string, any>, propertyName: string) {
        registerDecorator({
            name: 'JsonMaxSize',
            target: object.constructor,
            propertyName: propertyName,
            options: {
                message: `Size should be lower than ${max} bytes`,
                ...validationOptions,
            },
            constraints: [max],
            validator: JsonMaxSizeConstraint,
        });
    };
}
