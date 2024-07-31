import { Module } from '@nestjs/common';
import { SecurityModule } from '../security/security.module';
import { GetUserAction } from './actions/crud/get-user-action';
import { UpdateUserAction } from './actions/crud/update-user-action';
import { CreateUserAction } from './actions/crud/create-user-action';
import { ListUserAction } from './actions/crud/list-user-action';
import { DeleteUserAction } from './actions/crud/delete-user-action';
import { UserProcessTemporaryPassword } from './service/user-process-temporary-password.service';
import { UserPhoneVerifiedSubscriber } from './entity-subscriber/user-phone-verified-subscriber';
import { NotificationModule } from '@libs/notification';
import { UserCreatedByAdminNotification } from './notification/user-created-by-admin-notification';

@Module({
    imports: [
        SecurityModule,
        NotificationModule.register({
            events: [UserCreatedByAdminNotification],
        }),
    ],
    controllers: [GetUserAction, UpdateUserAction, CreateUserAction, ListUserAction, DeleteUserAction],
    providers: [UserProcessTemporaryPassword, UserPhoneVerifiedSubscriber],
})
export class UserModule {}
