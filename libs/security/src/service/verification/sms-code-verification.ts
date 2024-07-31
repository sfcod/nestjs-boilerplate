import { Inject, Injectable } from '@nestjs/common';
import { CodeStorageInterface } from '../../contract/code-storage.interface';
import * as ms from 'ms';
import { AbstractCodeVerification, Composing as BaseComposing, ThrottleParams } from './abstract-code-verification';
import { CodeGenerator } from '@libs/core';
import { SmsSenderInterface } from '../../contract/sms-sender.interface';

type Composing = BaseComposing & { code?: string };

@Injectable()
export class SmsCodeVerification extends AbstractCodeVerification {
    constructor(
        @Inject('CodeStorage') protected readonly codeStorage: CodeStorageInterface,
        protected readonly codeGenerator: CodeGenerator,
        @Inject('SmsSender') protected readonly smsSender: SmsSenderInterface,
    ) {
        super(codeStorage);
    }

    public async send(composing: Composing, throttleParams: ThrottleParams = {}): Promise<string> {
        const composingParams = {
            code: this.generate(),
            template: 'Phone number verification.\nYour code is: {{code}}',
            ...composing,
        };
        const params = {
            throttleKey: `send`,
            throttleTime: ms(process.env.TWO_FACTOR_AUTH_CODE_SEND_THROTTLE || '30s'),
            ...throttleParams,
        };

        await this.throttleSend(composingParams, params, () =>
            this.smsSender.send({
                to: composingParams.to,
                body: composingParams.template.replace('{{code}}', composingParams.code),
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
        return this.codeGenerator.generateNumbersString();
    }
}
