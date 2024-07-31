import '../../dotenv';
import { Module } from '@nestjs/common';
import { OrmModule } from '@libs/orm';
import { ConfigModule } from '@nestjs/config';
import configConfig from '../../../config/config.config';
import { RedisModule } from '@songkeys/nestjs-redis';
import redisConfig from '../../../config/redis.config';
import mikroOrmConfig from '../../../config/mikro-orms.config';
import { CoreModule } from '@libs/core';
import { ConsoleModule } from 'nestjs-console';
import { MigrationModule } from './migration/migration.module';
import { SeedModule } from './seed/seed.module';
import { FileStorageModule } from '@libs/file-storage';
import fileStorageConfig from 'config/file-storage.config';
import { MailerModule } from '@libs/mailer';
import mailerConfig from '../../../config/mailer.config';
import { CommonModule } from './common/common.module';
import { CommandModule } from './command/command.module';
import eventEmitterConfig from '../../../config/event-emitter.config';

export const APP_NAME = 'database';

@Module({
    imports: [
        MigrationModule,
        SeedModule,
        // ------- >Service modules ------- //
        CommonModule.register(),
        OrmModule.register(mikroOrmConfig),
        ConfigModule.forRoot(configConfig),
        RedisModule.forRoot(redisConfig),
        FileStorageModule.register(fileStorageConfig),
        MailerModule.register(mailerConfig),
        CoreModule.register({
            eventEmitter: eventEmitterConfig,
        }),
        ConsoleModule,
        CommandModule.register(),
        // ------- <Service modules ------- //
    ],
    controllers: [],
    providers: [],
})
export class DatabaseModule {}
