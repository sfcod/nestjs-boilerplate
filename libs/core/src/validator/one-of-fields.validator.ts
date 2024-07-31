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
export class OneOfFieldsConstraint implements ValidatorConstraintInterface {
    async validate(value: any, args: ValidationArguments) {
        const [fields] = args.constraints;

        return fields.some((field) => !!(args.object as any)?.[field]);
    }
}

export function OneOfFields(fields: string[], validationOptions?: ValidationOptions) {
    return function (object: Record<string, any>, propertyName: string) {
        registerDecorator({
            name: 'OneOfFields',
            target: object.constructor,
            propertyName: propertyName,
            options: {
                message: `One of fields ${JSON.stringify(fields)} should not be empty`,
                ...validationOptions,
            },
            constraints: [fields],
            validator: OneOfFieldsConstraint,
        });
    };
}
