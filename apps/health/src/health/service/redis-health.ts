import { Injectable } from '@nestjs/common';
import { HealthCheckService } from '@nestjs/terminus';
import { RedisHealthIndicator } from '../indicator/redis.health';

@Injectable()
export class RedisHealth {
    constructor(
        private readonly health: HealthCheckService,
        private readonly redis: RedisHealthIndicator,
    ) {}

    async check() {
        return [() => this.redis.pingCheck('redis')];
    }
}
