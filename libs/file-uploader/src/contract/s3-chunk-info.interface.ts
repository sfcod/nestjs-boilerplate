export interface S3ChunkInfoInterface {
    set(key: string, value: any, expirationTime?: number): Promise<boolean>;

    get(key: string): Promise<string | null>;

    del(key: string): Promise<boolean>;
}
