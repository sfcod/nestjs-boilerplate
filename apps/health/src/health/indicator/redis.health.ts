import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError, TimeoutError } from '@nestjs/terminus';
import { RedisService } from '@songkeys/nestjs-redis';
import { promiseTimeout, TimeoutError as PromiseTimeoutError } from '@nestjs/terminus/dist/utils';

export interface RedisIndicatorOptions {
    redisService?: RedisService;
    timeout?: number;
}

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
    public constructor(protected readonly redisService: RedisService) {
        super();
    }

    async pingCheck(key: string, options: RedisIndicatorOptions = { timeout: 2000 }): Promise<HealthIndicatorResult> {
        try {
            const redis = options.redisService || this.redisService;
            const pong = await promiseTimeout(options.timeout, redis.getClient().ping());
            const isHealthy = pong === 'PONG';
            const result = this.getStatus(key, isHealthy);

            if (isHealthy) {
                return result;
            }

            throw new HealthCheckError(`${key} is not available`, result);
        } catch (err) {
            if (err instanceof PromiseTimeoutError) {
                throw new TimeoutError(
                    options.timeout,
                    this.getStatus(key, false, {
                        message: `timeout of ${options.timeout}ms exceeded`,
                    }),
                );
            }
        }
    }
}
