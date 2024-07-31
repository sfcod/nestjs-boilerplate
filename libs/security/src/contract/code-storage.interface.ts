export interface CodeStorageInterface {
    set(key: string, value: string, expirationTime?: number): Promise<boolean>;

    get(key: string, parse?: boolean): Promise<any | null>;

    del(key: string): Promise<boolean>;
}
