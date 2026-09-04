import { Injectable, Scope } from '@nestjs/common';
import { HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus';
import { RedisService } from '@songkeys/nestjs-redis';

export interface RedisIndicatorOptions {
    redisService?: RedisService;
    timeout?: number;
}

@Injectable({ scope: Scope.TRANSIENT })
export class RedisHealthIndicator {
    public constructor(
        protected readonly redisService: RedisService,
        private readonly healthIndicatorService: HealthIndicatorService,
    ) {}

    async pingCheck<Key extends string>(
        key: Key,
        options: RedisIndicatorOptions = { timeout: 2000 },
    ): Promise<HealthIndicatorResult<Key>> {
        return this.healthIndicatorService
            .check(key)
            .attempt(async () => {
                const redis = options.redisService || this.redisService;
                const pong = await redis.getClient().ping();

                if (pong !== 'PONG') {
                    throw new Error(`${key} is not available`);
                }
            })
            .withTimeout(options.timeout ?? 2000);
    }
}
