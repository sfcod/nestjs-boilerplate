import { DynamicModule, ExistingProvider, FactoryProvider, MiddlewareConsumer, Module, Type } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PasswordHash } from './service/password-hash';
import { JwtRefreshStrategy } from './strategy/jwt-refresh-strategy';
import { JwtStrategy } from './strategy/jwt-strategy';
import { RefreshToken } from './service/jwt-token/refresh-token';
import { RolePermission } from './service/role-permission';
import { RolePermissionMiddleware } from './middleware/role-permission.middleware';
import { JwtGuestStrategy } from './strategy/jwt-guest-strategy';
import { SignerBuilder } from './service/signer-builder';
import { CodeAuthenticator } from './service/code-authenticator';
import { SmsCodeAuthenticator } from './service/authenticator/sms-code-authenticator';
import { EmailCodeAuthenticator } from './service/authenticator/email-code-authenticator';
import { SmsCodeVerification } from './service/verification/sms-code-verification';
import { EmailCodeVerification } from './service/verification/email-code-verification';
import { JwtTokenHandler } from './strategy/jwt-token-handler';
import { AuthToken } from './service/jwt-token/auth-token';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { RedisStorage } from './service/code-storage/redis-storage';
import { CodeStorageInterface } from './contract/code-storage.interface';
import { UserAuthSignInSubscriber } from './event-subscriber/user-auth-sign-in-subscriber';
import { CredentialBruteForce } from './service/brute-force/credential-brute-force';
import { EntityManager } from '@mikro-orm/core';
import { createSendAuthCodeAction } from './actions/sign-in/send-auth-code-action';
import { createSignInAction } from './actions/sign-in/sign-in-action';
import { createVerifyAuthCodeAction } from './actions/sign-in/verify-auth-code-action';
import { createRefreshTokenAction } from './actions/sign-in/refresh-action';
import { LocalMixedStrategy } from './strategy/local-mixed-strategy';
import { LocalUserStrategy } from './strategy/local-user-strategy';
import { LocalAdminStrategy } from './strategy/local-admin-strategy';
import { AnonymousStrategy } from './strategy/anonymous-strategy';
import type { CodeAuthenticatorInterface } from './contract/code-authenticator.interface';
import { NotificationModule } from '@libs/notification';
import { EmailCodeAuthenticationNotification } from './notification/email-code-authentication-notification';
import { EmailCodeVerificationNotification } from './notification/email-code-verification-notification';
import { PasswordSubscriber } from './entity-subscriber/password-subscriber';
import { SmsSenderInterface } from './contract/sms-sender.interface';
import { ResetPasswordBruteForce } from './service/brute-force/reset-password-brute-force';
import { ResetPasswordService } from './service/reset-password-service';

export interface ActionOptions {
    actions: {
        actionName: 'SendAuthCodeAction' | 'SignInAction' | 'VerifyAuthCodeAction' | 'RefreshTokenAction';
        route: string;
        roles: string[];
        guards: any[];
    }[];
}

export interface SecurityOptions extends Pick<ModuleMetadata, 'imports'> {
    hierarchyRoles: any;
    smsSender?:
        | Omit<Type<SmsSenderInterface>, 'provide'>
        | Omit<FactoryProvider<SmsSenderInterface>, 'provide'>
        | Omit<ExistingProvider<SmsSenderInterface>, 'provide'>;
    codeStorage?:
        | Omit<Type<CodeStorageInterface>, 'provide'>
        | Omit<FactoryProvider<CodeStorageInterface>, 'provide'>
        | Omit<ExistingProvider<CodeStorageInterface>, 'provide'>;
}

const strategies = [
    JwtRefreshStrategy,
    JwtStrategy,
    JwtGuestStrategy,
    AnonymousStrategy,
    LocalMixedStrategy,
    LocalUserStrategy,
    LocalAdminStrategy,
];
const tokens = [RefreshToken, AuthToken];
const bruteForces = [CredentialBruteForce, ResetPasswordBruteForce];
const subscribers = [UserAuthSignInSubscriber, PasswordSubscriber];
const codeAuthenticators = [SmsCodeAuthenticator, EmailCodeAuthenticator];
const codeVerificators = [SmsCodeVerification, EmailCodeVerification];

@Module({})
export class SecurityModule {
    static register(options: SecurityOptions): DynamicModule {
        options = {
            codeStorage: RedisStorage,
            ...options,
        };

        return {
            module: SecurityModule,
            imports: [
                // OrmModule,
                PassportModule,
                JwtModule.register({
                    secret: process.env.JWT_SECRET_KEY,
                    verifyOptions: {
                        ignoreExpiration: false,
                    },
                }),
                NotificationModule.register({
                    events: [EmailCodeAuthenticationNotification, EmailCodeVerificationNotification],
                }),
                ...(options.imports || []),
            ],
            providers: [
                {
                    provide: 'HIERARCHY_ROLES',
                    useValue: options.hierarchyRoles,
                },
                {
                    provide: 'AuthTokenHandler',
                    useFactory: (em, token, jwtService) => {
                        return new JwtTokenHandler(em, token, jwtService);
                    },
                    inject: [EntityManager, AuthToken, JwtService],
                },
                {
                    provide: 'RefreshTokenHandler',
                    useFactory: (em, token, jwtService) => {
                        return new JwtTokenHandler(em, token, jwtService);
                    },
                    inject: [EntityManager, RefreshToken, JwtService],
                },
                options.smsSender
                    ? this.registerProvider<SmsSenderInterface>('SmsSender', options.smsSender)
                    : {
                          provide: 'SmsSender',
                          useFactory: (): SmsSenderInterface => {
                              return {
                                  send(): Promise<void> {
                                      throw new Error('SmsSender is not provided to security module.');
                                  },
                              };
                          },
                      },
                ...strategies,
                ...tokens,
                ...bruteForces,
                ...subscribers,
                ...codeAuthenticators,
                ...codeVerificators,
                RolePermission,
                PasswordHash,
                SignerBuilder,
                CodeAuthenticator,
                ResetPasswordService,
                this.registerProvider<CodeStorageInterface>('CodeStorage', options.codeStorage),
                this.registerProvider('CodeAuthenticators', {
                    useFactory: (...codeAuthenticators: CodeAuthenticatorInterface[]) => codeAuthenticators,
                    inject: codeAuthenticators,
                }),
            ],
            exports: [
                ...bruteForces,
                ...tokens,
                ...codeVerificators,
                'AuthTokenHandler',
                'RefreshTokenHandler',
                PasswordHash,
                RolePermission,
                SignerBuilder,
                CodeAuthenticator,
                ResetPasswordService,
            ],
        };
    }

    static registerActions(options: ActionOptions): Array<Type> {
        return options.actions.map(({ actionName, ...rest }) => {
            switch (actionName) {
                case 'SendAuthCodeAction':
                    return createSendAuthCodeAction(rest);
                case 'SignInAction':
                    return createSignInAction(rest);
                case 'VerifyAuthCodeAction':
                    return createVerifyAuthCodeAction(rest);
                case 'RefreshTokenAction':
                    return createRefreshTokenAction(rest);
            }
        });
    }

    private static registerProvider<T>(
        name: string,
        provider?:
            | Omit<Type<T>, 'provide'>
            | Omit<FactoryProvider<T>, 'provide'>
            | Omit<ExistingProvider<T>, 'provide'>,
    ): any {
        if (typeof provider === 'function') {
            return {
                provide: name,
                useClass: provider,
            };
        }

        if (typeof provider === 'object') {
            return {
                ...provider,
                provide: name,
            };
        }

        throw new Error('Can not process provider');
    }

    configure(consumer: MiddlewareConsumer): any {
        consumer.apply(RolePermissionMiddleware).forRoutes('*');
    }
}
