import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { OrmModule } from '@libs/orm';
import mikroOrmsConfig from '../../../../config/mikro-orms.config';
import redisConfig from '../../../../config/redis.config';
import { RedisModule } from '@songkeys/nestjs-redis';
import { RedisHealthIndicator } from './indicator/redis.health';
import { HttpModule } from '@nestjs/axios';
import { DatabaseHealth } from './service/database-health';
import { GatewayHealth } from './service/gateway-health';
// import { MongoHealth } from './service/mongo-health';
import { RabbitHealth } from './service/rabbit-health';
import { RedisHealth } from './service/redis-health';
import { HealthAction } from './actions/health-action';

@Module({
    controllers: [HealthAction],
    imports: [TerminusModule, HttpModule, OrmModule.register(mikroOrmsConfig), RedisModule.forRoot(redisConfig)],
    providers: [
        {
            provide: 'RABBITMQ_URLS',
            useValue: process.env.RABBITMQ_URLS.split(','),
        },
        {
            provide: 'API_URL',
            useValue: process.env.CLIENT_API_URL,
        },
        RedisHealthIndicator,
        DatabaseHealth,
        GatewayHealth,
        // MongoHealth,
        RabbitHealth,
        RedisHealth,
    ],
})
export class HealthModule {}
