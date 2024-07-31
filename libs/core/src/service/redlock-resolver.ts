import { RedisService } from '@songkeys/nestjs-redis';
import Redlock from 'redlock';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RedlockResolver {
    private redlock: Redlock;

    constructor(private readonly redisService: RedisService) {
        const redis = this.redisService.getClient();
        this.redlock = new Redlock([redis], {
            retryCount: 2147483647,
        });
    }

    public resolve(): Redlock {
        return this.redlock;
    }
}
