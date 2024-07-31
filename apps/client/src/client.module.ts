import '../../dotenv';
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { FileStorageModule } from '@libs/file-storage';
import { PublicModule } from './public/public.module';
import { SecurityModule } from './security/security.module';
import fileStorageConfig from '../../../config/file-storage.config';
import { OrmModule } from '@libs/orm';
import { ConsoleModule } from 'nestjs-console';
import { ConfigModule } from '@nestjs/config';
import configConfig from '../../../config/config.config';
import { RedisModule } from '@songkeys/nestjs-redis';
import redisConfig from '../../../config/redis.config';
import twilioConfig from '../../../config/twilio.config';
import { TwilioModule } from '@libs/twilio';
import mikroOrmConfig from '../../../config/mikro-orms.config';
import mailerConfig from '../../../config/mailer.config';
import { MailerModule } from '@libs/mailer';
import { CommonModule } from './common/common.module';
import { RequestContextModule } from '@libs/request-context';
import { CoreModule } from '@libs/core';
import eventEmitterConfig from '../../../config/event-emitter.config';
import { PusherModule } from '@libs/pusher';
import firebaseConfig from '../../../config/firebase.config';
import { SocialModule } from './social/social.module';

@Module({
    imports: [
        // ------- >Action modules ------- //
        UserModule,
        PublicModule,
        SecurityModule,
        SocialModule,
        // ------- <Action modules ------- //

        // ------- >Service modules ------- //
        FileStorageModule.register(fileStorageConfig),
        OrmModule.register(mikroOrmConfig),
        ConsoleModule,
        CoreModule.register({
            eventEmitter: eventEmitterConfig,
        }),
        CommonModule.register(),
        ConfigModule.forRoot(configConfig),
        RedisModule.forRoot(redisConfig),
        TwilioModule.register(twilioConfig),
        MailerModule.register(mailerConfig),
        PusherModule.register(firebaseConfig),
        RequestContextModule,
        // ------- <Service modules ------- //
    ],
    controllers: [],
    providers: [],
})
export class ClientModule {}
