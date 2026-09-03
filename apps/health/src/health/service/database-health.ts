import { Get, Injectable } from '@nestjs/common';
import { HealthCheckService, HealthCheck, MikroOrmHealthIndicator } from '@nestjs/terminus';
import { MikroORM } from '@mikro-orm/core';

@Injectable()
export class DatabaseHealth {
    constructor(
        private readonly health: HealthCheckService,
        private readonly db: MikroOrmHealthIndicator,
        private readonly orm: MikroORM,
    ) {}

    @Get()
    @HealthCheck()
    async check() {
        return [
            () =>
                this.db.pingCheck(this.orm.config.get('contextName'), {
                    timeout: 3000,
                    connection: Object.assign(this.orm.em.getConnection(), {
                        getPlatform: () => ({
                            getConfig: () => ({ get: () => 'postgresql' }),
                        }),
                    }),
                }),
        ];
    }
}
