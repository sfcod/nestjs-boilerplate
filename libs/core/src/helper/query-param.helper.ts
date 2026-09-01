export const uuid = (name: string) => `:uuid__${name}`;

export const number = (name: string) => {
    return `:${name}([0-9]*)`;
};

export const string = (name: string) => {
    return `:${name}([a-z0-9]*)`;
};
