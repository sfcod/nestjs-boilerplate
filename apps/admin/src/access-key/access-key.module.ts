import { Module } from '@nestjs/common';
import { AccessKeyModule as AccessKeyModuleBase } from '@libs/access-key';
import { CreateAccessKeyAction } from './actions/crud/create-access-key-action';
import { ListAccessKeyAction } from './actions/crud/list-access-key-action';
import { UpdateAccessKeyAction } from './actions/crud/update-access-key-action';
import { DeleteAccessKeyAction } from './actions/crud/delete-access-key-action';
import { GetAccessKeyAction } from './actions/crud/get-access-key-action';

@Module({
    controllers: [
        CreateAccessKeyAction,
        DeleteAccessKeyAction,
        ListAccessKeyAction,
        UpdateAccessKeyAction,
        GetAccessKeyAction,
    ],
    imports: [AccessKeyModuleBase],
    exports: [AccessKeyModuleBase],
})
export class AccessKeyModule {}
