import '../../dotenv';
import { Module } from '@nestjs/common';
import { PublicModule } from './public/public.module';
import { SecurityModule } from './security/security.module';
import { UserModule } from './user/user.module';
import { AccessKeyModule } from './access-key/access-key.module';
import { AdminModule } from './admin/admin.module';
import { FileStorageModule } from '@libs/file-storage';
import fileStorageConfig from '../../../config/file-storage.config';
import { OrmModule } from '@libs/orm';
import { ConfigModule } from '@nestjs/config';
import configConfig from '../../../config/config.config';
import { RedisModule } from '@songkeys/nestjs-redis';
import redisConfig from '../../../config/redis.config';
import { NotificationModule } from '@libs/notification';
import { CommonModule } from './common/common.module';
import mikroOrmsConfig from '../../../config/mikro-orms.config';
import mailerConfig from '../../../config/mailer.config';
import { MailerModule } from '@libs/mailer';
import { BullModule } from '@nestjs/bullmq';
import { RequestContextModule } from '@libs/request-context';
import { CoreModule } from '@libs/core';
import eventEmitterConfig from '../../../config/event-emitter.config';
import queueConfig from '../../../config/queue.config';
// import { TwilioModule } from '@libs/twilio';
// import twilioConfig from '../../../config/twilio.config';
import { ScheduleModule } from '@nestjs/schedule';

export const APP_NAME = 'admin';

@Module({
    imports: [
        // ------- >Action modules ------- //
        AccessKeyModule,
        SecurityModule,
        PublicModule,
        UserModule,
        AdminModule,
        AccessKeyModule,
        // ------- <Action modules ------- //

        // ------- >Service modules ------- //
        FileStorageModule.register(fileStorageConfig),
        OrmModule.register(mikroOrmsConfig),
        CommonModule.register(),
        CoreModule.register({
            eventEmitter: eventEmitterConfig,
        }),
        // TwilioModule.register(twilioConfig),
        ConfigModule.forRoot(configConfig),
        RedisModule.forRoot(redisConfig),
        ScheduleModule.forRoot(),
        NotificationModule,
        MailerModule.register(mailerConfig),
        BullModule.forRoot(queueConfig),
        RequestContextModule,
        // ------- <Service modules ------- //
    ],
    controllers: [],
    providers: [],
})
export class AdminPanelModule {}
