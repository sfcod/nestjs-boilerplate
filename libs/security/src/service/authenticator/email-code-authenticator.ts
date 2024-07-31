import { Inject, Injectable } from '@nestjs/common';
import { CodeStorageInterface } from '../../contract/code-storage.interface';
import { CodeGenerator } from '@libs/core';
import { AbstractCodeAuthenticator } from './abstract-code-authenticator';
import { User2FAInterface } from '../../contract/user-2fa.interface';
import { NotificationEmitter } from '@libs/notification';
import { EmailCodeAuthenticationNotification } from '../../notification/email-code-authentication-notification';

type Params = Record<string, any> & {
    emailTemplate?: string;
};

@Injectable()
export class EmailCodeAuthenticator extends AbstractCodeAuthenticator {
    constructor(
        @Inject('CodeStorage') protected readonly codeStorage: CodeStorageInterface,
        protected readonly codeGenerator: CodeGenerator,
        private readonly notification: NotificationEmitter,
    ) {
        super(codeStorage, codeGenerator);
    }

    public async send(user: User2FAInterface, params: Params = {}) {
        if (!user.getAuthenticatorIdentity()) {
            return;
        }

        const code = await this.generate(user);
        await this.notification.emit(EmailCodeAuthenticationNotification, {
            user,
            code,
            template: params.emailTemplate,
        });
    }
}
