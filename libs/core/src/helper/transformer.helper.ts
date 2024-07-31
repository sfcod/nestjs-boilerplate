import { isArray } from 'lodash';

export const transformToRegExp = ({ value }) => (value ? new RegExp(value, 'i') : undefined);

export const transformToILike = ({ value }) => (value ? { $ilike: `%${value}%` } : undefined);

export const transformToBoolean = ({ value }) => {
    if (value === undefined) {
        return value;
    }

    return value ? !['false', false, 0, '0'].includes(value) : false;
};

export const transformToNumber = ({ value }) => {
    if (value === undefined) {
        return value;
    }

    return Number(value);
};

export const transformToArray = ({ value }) => {
    if (value === undefined) {
        return value;
    }
    if (isArray(value)) {
        return { $in: value };
    }
    return { $in: [value] };
};
