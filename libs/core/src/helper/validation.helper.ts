import { ValidationError } from '@nestjs/common';

export const createValidationError = <T extends Record<any, any>>(
    target: T,
    property: keyof T,
    message: string,
): ValidationError => {
    return {
        target,
        property: property as string,
        value: target[property],
        constraints: {
            CustomConstraint: message,
        },
        children: [],
    };
};
