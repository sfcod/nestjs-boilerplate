export const storageKeyInDb = (object: Record<any, any>, key: string): string => {
    return `${object.constructor.name}-${key}`;
};
