import { Module } from '@nestjs/common';
import { LocalStorage, RedisStorage, SecurityModule as SecurityModuleCore } from '@libs/security';
import { hierarchyRoles } from '../../../../config/hierarchy-roles';
import { RedisService } from '@songkeys/nestjs-redis';
import { AuthGuard } from '@nestjs/passport';
import { NotificationModule } from '@libs/notification';
import { ResetPasswordTokenNotification } from './notification/reset-password-token-notification';
import { ChangePasswordAction } from './actions/reset-password/change-password-action';
import { ResetPasswordAction } from './actions/reset-password/reset-password-action';
import { VerifyCodeAction } from './actions/reset-password/verify-code-action';
import { UserDeleteVoter } from './voter/user/user-delete.voter';
import { UserGetVoter } from './voter/user/user-get.voter';
import { UserUpdateVoter } from './voter/user/user-update.voter';

const UserVoters = [UserDeleteVoter, UserGetVoter, UserUpdateVoter];

@Module({
    providers: [...UserVoters],
    controllers: [
        ChangePasswordAction,
        ResetPasswordAction,
        VerifyCodeAction,
        ...SecurityModuleCore.registerActions({
            actions: [
                {
                    actionName: 'RefreshTokenAction',
                    guards: [AuthGuard('refresh')],
                    roles: [],
                    route: `api-client/auths/refresh`,
                },
                {
                    actionName: 'SignInAction',
                    guards: [AuthGuard('local-user')],
                    roles: [],
                    route: `api-client/auths/user`,
                },
                {
                    actionName: 'SendAuthCodeAction',
                    guards: [AuthGuard('jwt-guest')],
                    roles: [],
                    route: `api-client/auths/send-code`,
                },
                {
                    actionName: 'VerifyAuthCodeAction',
                    guards: [AuthGuard('jwt-guest')],
                    roles: [],
                    route: `api-client/auths/verify-code`,
                },
            ],
        }),
    ],
    imports: [
        SecurityModuleCore.register({
            hierarchyRoles: hierarchyRoles,
            codeStorage:
                // @Todo If remove this trick then the error throws "Cannot read property 'getClient' of undefined"
                process.env.NODE_ENV === 'test'
                    ? LocalStorage
                    : {
                          useFactory: (redisService: RedisService) => {
                              return new RedisStorage(redisService);
                          },
                          inject: [RedisService],
                      },
        }),
        NotificationModule.register({
            events: [ResetPasswordTokenNotification],
        }),
    ],
    exports: [SecurityModuleCore, ...UserVoters],
})
export class SecurityModule {}
