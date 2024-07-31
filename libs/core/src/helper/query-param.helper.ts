export const uuid = (name: string) => {
    return `:${name}([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89AB][0-9a-f]{3}-[0-9a-f]{12})`;
};

export const number = (name: string) => {
    return `:${name}([0-9]*)`;
};

export const string = (name: string) => {
    return `:${name}([a-z0-9]*)`;
};
