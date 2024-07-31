import { CodeStorageInterface } from '../../contract/code-storage.interface';

export class LocalStorage implements CodeStorageInterface {
    protected data: Map<any, any> = new Map<any, any>();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async set(key: string, value: string, expirationTime?: number): Promise<boolean> {
        this.data.set(key, value);

        return true;
    }

    async get(key: string, parse = false): Promise<string | null> {
        const data = this.data.get(key);

        return data && parse ? JSON.parse(data) : data;
    }

    async del(key: string): Promise<boolean> {
        return this.data.delete(key);
    }
}
