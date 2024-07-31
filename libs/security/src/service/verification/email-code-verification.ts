import { Inject, Injectable } from '@nestjs/common';
import { CodeStorageInterface } from '../../contract/code-storage.interface';
import * as ms from 'ms';
import { AbstractCodeVerification, Composing as BaseComposing, ThrottleParams } from './abstract-code-verification';
import { CodeGenerator } from '@libs/core';
import { NotificationEmitter } from '@libs/notification';
import { EmailCodeVerificationNotification } from '../../notification/email-code-verification-notification';

type Composing = BaseComposing & { code?: string };

@Injectable()
export class EmailCodeVerification extends AbstractCodeVerification {
    constructor(
        @Inject('CodeStorage') protected readonly codeStorage: CodeStorageInterface,
        protected readonly codeGenerator: CodeGenerator,
        private readonly notification: NotificationEmitter,
    ) {
        super(codeStorage);
    }

    public async send(composing: Composing, throttleParams: ThrottleParams = {}): Promise<string> {
        const composingParams = {
            code: this.generate(),
            ...composing,
        };
        const params = {
            throttleKey: `send`,
            throttleTime: ms(process.env.TWO_FACTOR_AUTH_CODE_SEND_THROTTLE || '30s'),
            ...throttleParams,
        };

        await this.throttleSend(composingParams, params, () =>
            this.notification.emit(EmailCodeVerificationNotification, {
                email: composing.to,
                code: composingParams.code,
                template: composingParams.template,
            }),
        );

        return composingParams.code;
    }

    public async verify(code: string, compare: string, throttleParams: ThrottleParams = {}): Promise<boolean> {
        const params = {
            throttleKey: `verify`,
            throttleTime: ms(process.env.TWO_FACTOR_AUTH_CODE_VERIFY_THROTTLE || '30s'),
            ...throttleParams,
        };

        return this.throttleVerify({ code }, params, async () => code === compare);
    }

    public generate(): string {
        return this.codeGenerator.generateHexString(12);
    }
}
