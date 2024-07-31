import { Inject, Injectable } from '@nestjs/common';
import { CodeStorageInterface } from '../../contract/code-storage.interface';
import { CodeGenerator } from '@libs/core';
import { AbstractCodeAuthenticator } from './abstract-code-authenticator';
import { User2FAInterface } from '../../contract/user-2fa.interface';
import { SmsSenderInterface } from '../../contract/sms-sender.interface';

type Params = Record<string, any> & {
    smsTemplate?: string;
};

@Injectable()
export class SmsCodeAuthenticator extends AbstractCodeAuthenticator {
    constructor(
        @Inject('CodeStorage') protected readonly codeStorage: CodeStorageInterface,
        protected readonly codeGenerator: CodeGenerator,
        @Inject('SmsSender') protected readonly smsSender: SmsSenderInterface,
    ) {
        super(codeStorage, codeGenerator);
    }

    public async send(user: User2FAInterface, params: Params = {}): Promise<void> {
        if (!user.getAuthenticatorIdentity()) {
            return;
        }

        const code = await this.generate(user);
        const template = params?.smsTemplate || `You are trying to login in PHY app. Your code is {{code}}`;

        await this.smsSender.send({
            to: user.getAuthenticatorIdentity(),
            body: template.replace('{{code}}', code),
        });
    }
}
