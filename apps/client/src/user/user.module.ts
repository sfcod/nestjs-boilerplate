import { Module } from '@nestjs/common';
import { SecurityModule } from '../security/security.module';
import { SocialModule } from '../social/social.module';
import { GetUserAction } from './action/crud/get-user-action';
import { UpdateUserAction } from './action/crud/update-user-action';
import { DeleteUserAction } from './action/crud/delete-user-action';
import { GetUserGuard } from './guard/get-user.guard';
import { UpdateUserGuard } from './guard/update-user.guard';
import { DeleteUserGuard } from './guard/delete-user.guard';
import { DELETE_USER_DATA_QUEUE, registerQueue } from '@libs/core';
import { TwilioModule } from '@libs/twilio';
import twilioConfig from '../../../../config/twilio.config';

@Module({
    imports: [
        SecurityModule,
        SocialModule,
        TwilioModule.register(twilioConfig),
        // ------- >Queues ------- //
        registerQueue(DELETE_USER_DATA_QUEUE),
        // ------- <Queues ------- //
    ],
    controllers: [GetUserAction, UpdateUserAction, DeleteUserAction],
    providers: [GetUserGuard, UpdateUserGuard, DeleteUserGuard],
})
export class UserModule {}
