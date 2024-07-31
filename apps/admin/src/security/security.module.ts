import { Module } from '@nestjs/common';
import { LocalStorage, RedisStorage, SecurityModule as SecurityModuleCore } from '@libs/security';
import { AdminDeactivateVoter } from './voter/admin/admin-deactivate.voter';
import { AdminDeleteVoter } from './voter/admin/admin-delete.voter';
import { hierarchyRoles } from '../../../../config/hierarchy-roles';
import { RedisService } from '@songkeys/nestjs-redis';
import { AuthGuard } from '@nestjs/passport';

const AdminVoters = [AdminDeactivateVoter, AdminDeleteVoter];

@Module({
    controllers: [
        ...SecurityModuleCore.registerActions({
            actions: [
                {
                    actionName: 'RefreshTokenAction',
                    guards: [AuthGuard('refresh')],
                    roles: [],
                    route: `api-admin/auths/refresh`,
                },
                {
                    actionName: 'SignInAction',
                    guards: [AuthGuard('local-admin')],
                    roles: [],
                    route: `api-admin/auths/admin`,
                },
                {
                    actionName: 'SendAuthCodeAction',
                    guards: [AuthGuard('jwt-guest')],
                    roles: [],
                    route: `api-admin/auths/send-code`,
                },
                {
                    actionName: 'VerifyAuthCodeAction',
                    guards: [AuthGuard('jwt-guest')],
                    roles: [],
                    route: `api-admin/auths/verify-code`,
                },
            ],
        }),
    ],
    imports: [
        SecurityModuleCore.register({
            hierarchyRoles: hierarchyRoles,
            // @Todo Workaround for tests
            codeStorage:
                process.env.NODE_ENV === 'test'
                    ? LocalStorage
                    : {
                          useFactory: (redisService: RedisService) => {
                              return new RedisStorage(redisService);
                          },
                          inject: [RedisService],
                      },
        }),
    ],
    providers: [...AdminVoters],
    exports: [SecurityModuleCore, ...AdminVoters],
})
export class SecurityModule {}
