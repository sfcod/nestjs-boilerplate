import { DynamicModule, Module, Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { createWebauthnAuthenticationAction } from './actions/webauthn-authentication-action';
import { createWebauthnRegistrationAction } from './actions/webauthn-registration-action';
import { createWebauthnAuthenticationVerifyAction } from './actions/webauthn-authentication-verify-action';
import { createWebauthnRegistrationVerifyAction } from './actions/webauthn-registration-verify-action';
import { createWebauthnDeleteDeviceAction } from './actions/webauthn-delete-device-action';
import { WebauthnStorage } from './service/webauthn-storage';
import { WebauthnAuthenticator, WebauthnConfig } from './service/webauthn-authenticator';
import { WebauthnDeleteDeviceGuard } from './guard/webauthn-delete-device.guard';

export interface ActionOptions {
    actions: {
        actionName:
            | 'WebauthnAuthenticationAction'
            | 'WebauthnRegistrationAction'
            | 'WebauthnAuthenticationVerifyAction'
            | 'WebauthnRegistrationVerifyAction'
            | 'WebauthnDeleteDeviceAction';
        route: string;
        roles: string[];
        guards: any[];
    }[];
}

export interface WebauthnOptions extends Pick<ModuleMetadata, 'imports'> {
    config: WebauthnConfig;
}

const strategies = [];

@Module({})
export class WebauthnModule {
    static register(options: WebauthnOptions): DynamicModule {
        return {
            module: WebauthnModule,
            imports: [...(options.imports || [])],
            providers: [
                ...strategies,
                WebauthnStorage,
                WebauthnDeleteDeviceGuard,
                {
                    provide: WebauthnAuthenticator,
                    useFactory: (storage: WebauthnStorage) => new WebauthnAuthenticator(options.config, storage),
                    inject: [WebauthnStorage],
                },
            ],
            exports: [WebauthnAuthenticator, WebauthnDeleteDeviceGuard],
        };
    }

    static registerActions(options: ActionOptions): Array<Type> {
        return options.actions.map(({ actionName, ...rest }) => {
            switch (actionName) {
                case 'WebauthnAuthenticationAction':
                    return createWebauthnAuthenticationAction(rest);
                case 'WebauthnRegistrationAction':
                    return createWebauthnRegistrationAction(rest);
                case 'WebauthnAuthenticationVerifyAction':
                    return createWebauthnAuthenticationVerifyAction(rest);
                case 'WebauthnRegistrationVerifyAction':
                    return createWebauthnRegistrationVerifyAction(rest);
                case 'WebauthnDeleteDeviceAction':
                    return createWebauthnDeleteDeviceAction(rest);
            }
        });
    }
}
