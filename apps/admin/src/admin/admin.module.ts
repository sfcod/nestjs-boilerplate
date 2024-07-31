import { Module } from '@nestjs/common';
import { SecurityModule } from '@app/admin/security/security.module';
import { UpdateAdminAction } from './actions/crud/update-admin-action';
import { CreateAdminAction } from './actions/crud/create-admin-action';
import { ListAdminAction } from './actions/crud/list-admin-action';
import { GetAdminAction } from './actions/crud/get-admin-action';
import { DeleteAdminAction } from './actions/crud/delete-admin-action';
import { DeleteAdminGuard } from './guard/delete-admin.guard';
import { UpdateAdminValidationPipe } from './pipe/update-admin-validation.pipe';
import { NotificationModule } from '@libs/notification';
import { AdminCreatedByAdminNotification } from './notification/admin-created-by-admin-notification';

@Module({
    controllers: [UpdateAdminAction, CreateAdminAction, ListAdminAction, GetAdminAction, DeleteAdminAction],
    imports: [
        SecurityModule,
        NotificationModule.register({
            events: [AdminCreatedByAdminNotification],
        }),
    ],
    providers: [DeleteAdminGuard, UpdateAdminValidationPipe],
})
export class AdminModule {}
