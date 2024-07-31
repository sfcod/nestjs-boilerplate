import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { CountryCode, parsePhoneNumberFromString } from 'libphonenumber-js';

@Injectable()
@ValidatorConstraint({ async: true })
export class PhoneNumberConstraint implements ValidatorConstraintInterface {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async validate(value: any, args: ValidationArguments) {
        const [region] = args.constraints;

        if (!/^\+?[0-9]{10,15}$/.test(value)) {
            return false;
        }

        const phoneNumber = parsePhoneNumberFromString(value, region);
        return phoneNumber ? phoneNumber.isValid() : false;
    }
}

export function PhoneNumber(region?: CountryCode, validationOptions?: ValidationOptions) {
    return function (object: Record<string, any>, propertyName: string) {
        registerDecorator({
            name: 'PHONE_NUMBER',
            target: object.constructor,
            propertyName: propertyName,
            options: {
                message: 'Is not a valid phone number',
                ...validationOptions,
            },
            constraints: [region],
            validator: PhoneNumberConstraint,
        });
    };
}
