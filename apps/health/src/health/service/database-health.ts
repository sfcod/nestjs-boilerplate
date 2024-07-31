import { Get, Injectable } from '@nestjs/common';
import { HealthCheckService, HealthCheck, MikroOrmHealthIndicator } from '@nestjs/terminus';
import { OrmResolver } from '@libs/orm-core';

@Injectable()
export class DatabaseHealth {
    constructor(
        private readonly health: HealthCheckService,
        private readonly db: MikroOrmHealthIndicator,
        private readonly ormResolver: OrmResolver,
    ) {}

    @Get()
    @HealthCheck()
    async check() {
        return this.ormResolver.getConnections().map(({ config, em }) => () => {
            return this.db.pingCheck(config.get('contextName'), {
                timeout: 3000,
                connection: Object.assign(em.getConnection(), {
                    getPlatform: () => ({
                        getConfig: () => ({ get: () => 'postgresql' }),
                    }),
                }),
            });
        });
    }
}
