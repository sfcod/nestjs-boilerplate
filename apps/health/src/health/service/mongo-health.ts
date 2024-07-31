import { Inject } from '@nestjs/common';
import { HealthCheckService, MongooseHealthIndicator } from '@nestjs/terminus';
import { Connection } from 'mongoose';

// @Injectable()
export class MongoHealth {
    constructor(
        private readonly health: HealthCheckService,
        private readonly db: MongooseHealthIndicator,
        @Inject('MONGOOSE_CONNECTIONS') private readonly connections: Connection[],
    ) {}

    async check() {
        return this.connections.map((connection) => () => {
            return this.db.pingCheck(connection.name, { connection });
        });
    }
}
