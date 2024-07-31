import { CodeStorageInterface } from '../../contract/code-storage.interface';
import { RedisService } from '@songkeys/nestjs-redis';

export class RedisStorage implements CodeStorageInterface {
    public constructor(protected readonly redisService: RedisService) {}

    async set(key: string, value: string, expirationTime?: number): Promise<boolean> {
        if (expirationTime <= 0) {
            return true;
        }
        const res = await this.redisService.getClient().set(key, value, 'PX', expirationTime);
        return res === 'OK';
    }

    async get(key: string, parse = false): Promise<string | null> {
        const data = await this.redisService.getClient().get(key);

        return data && parse ? JSON.parse(data) : data;
    }

    async del(key: string): Promise<boolean> {
        return (await this.redisService.getClient().del(key)) > 0;
    }
}
