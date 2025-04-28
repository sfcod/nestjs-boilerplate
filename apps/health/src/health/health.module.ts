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
import { RedisHealth } from './service/redis-health';
import { HealthAction } from './actions/health-action';

@Module({
    controllers: [HealthAction],
    imports: [TerminusModule, HttpModule, OrmModule.register(mikroOrmsConfig), RedisModule.forRoot(redisConfig)],
    providers: [
        {
            provide: 'API_URL',
            useValue: process.env.CLIENT_API_URL,
        },
        RedisHealthIndicator,
        DatabaseHealth,
        GatewayHealth,
        // MongoHealth,
        RedisHealth,
    ],
})
export class HealthModule { }
