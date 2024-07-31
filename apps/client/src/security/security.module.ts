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
import { WebauthnModule, WebauthnDeleteDeviceGuard } from '@libs/webauthn';
import webauthnConfig from '../../../../config/webauthn.config';
import { uuid } from '@libs/core';
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
                    route: `api/auths/refresh`,
                },
                {
                    actionName: 'SignInAction',
                    guards: [AuthGuard('local-user')],
                    roles: [],
                    route: `api/auths/user`,
                },
                {
                    actionName: 'SendAuthCodeAction',
                    guards: [AuthGuard('jwt-guest')],
                    roles: [],
                    route: `api/auths/send-code`,
                },
                {
                    actionName: 'VerifyAuthCodeAction',
                    guards: [AuthGuard('jwt-guest')],
                    roles: [],
                    route: `api/auths/verify-code`,
                },
            ],
        }),
        ...WebauthnModule.registerActions({
            actions: [
                {
                    actionName: 'WebauthnRegistrationAction',
                    guards: [AuthGuard(['jwt', 'jwt-guest'])],
                    roles: [],
                    route: `api/auths/webauthn/registration`,
                },
                {
                    actionName: 'WebauthnRegistrationVerifyAction',
                    guards: [AuthGuard(['jwt', 'jwt-guest'])],
                    roles: [],
                    route: `api/auths/webauthn/registration/verify`,
                },
                {
                    actionName: 'WebauthnAuthenticationAction',
                    guards: [],
                    roles: [],
                    route: `api/auths/webauthn/authentication`,
                },
                {
                    actionName: 'WebauthnAuthenticationVerifyAction',
                    guards: [],
                    roles: [],
                    route: `api/auths/webauthn/authentication/verify`,
                },
                {
                    actionName: 'WebauthnDeleteDeviceAction',
                    guards: [AuthGuard(['jwt', 'jwt-guest']), WebauthnDeleteDeviceGuard],
                    roles: [],
                    route: `api/auths/webauthn/device/${uuid('id')}`,
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
        WebauthnModule.register({
            config: webauthnConfig,
        }),
        NotificationModule.register({
            events: [ResetPasswordTokenNotification],
        }),
    ],
    exports: [SecurityModuleCore, ...UserVoters],
})
export class SecurityModule {}
