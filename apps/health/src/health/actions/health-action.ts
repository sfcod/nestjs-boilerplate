import { Controller, Get, Logger, ServiceUnavailableException, UseGuards } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { DatabaseHealth } from '../service/database-health';
import { RabbitHealth } from '../service/rabbit-health';
import { RedisHealth } from '../service/redis-health';
import { GatewayHealth } from '../service/gateway-health';
import { HealthCheckStatus } from '@nestjs/terminus';
import { HealthGuard } from '../guard/health-guard';

@Controller(`health`)
export class HealthAction {
    protected readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly health: HealthCheckService,
        private readonly dbHealth: DatabaseHealth,
        private readonly rabbitHealth: RabbitHealth,
        private readonly redisHealth: RedisHealth,
        private readonly gatewayHealth: GatewayHealth,
    ) {}

    @Get()
    @UseGuards(HealthGuard)
    @HealthCheck()
    async invoke(): Promise<{ status: HealthCheckStatus }> {
        try {
            const healthCheckResult = await this.health.check([
                ...(await this.dbHealth.check()),
                ...(await this.rabbitHealth.check()),
                ...(await this.redisHealth.check()),
                ...(await this.gatewayHealth.check()),
            ]);

            return {
                status: healthCheckResult['status'],
            };
        } catch (e) {
            throw new ServiceUnavailableException(
                `Services unavailable: ${Object.keys(e?.response?.error || {})
                    .map((key) => key)
                    .join(', ')}`,
            );
        }
    }
}
