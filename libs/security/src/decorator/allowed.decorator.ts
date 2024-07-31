export const ALLOWED_METADATA_FIELD = 'allowed_to_props';
import { getMetadataStorage } from 'class-validator';

/**
 * Use this decorator on input dto's to restrict users from submitting some fields.
 * If user role does not satisfy decorator's role, dto's property will be cleared
 */
export function Allowed<T = Record<any, any>>(...roles: string[]) {
    return function (target: T, propertyKey: string) {
        // using class validator storage because Reflect metadata is lost after extending PartialType/OmitType
        const storage = getMetadataStorage();
        storage.addValidationMetadata({
            type: ALLOWED_METADATA_FIELD,
            target: target.constructor,
            propertyName: propertyKey,
            context: roles,
            constraints: [],
            message: '',
            groups: [],
            validationTypeOptions: null,
            each: false,
            constraintCls: () => null,
        });
    };
}
