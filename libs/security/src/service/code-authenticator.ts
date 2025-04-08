import { SmsCodeAuthenticator } from './authenticator/sms-code-authenticator';
import { EmailCodeAuthenticator } from './authenticator/email-code-authenticator';
import { Inject, Injectable } from '@nestjs/common';
import { CodeStorageInterface } from '../contract/code-storage.interface';
import { storageKeyInDb } from '../helper/storage.helper';
import { DateTime } from 'luxon';
import * as ms from 'ms';
import { CodeSendThrottleException } from '../exception/code-send-throttle-exception';
import { CodeVerifyThrottleException } from '../exception/code-verify-throttle-exception';
import { User2FAInterface } from '../contract/user-2fa.interface';
import { CodeAuthenticatorInterface } from '../contract/code-authenticator.interface';
import { UserInterface } from '../contract/user-interface';
import { CodeAuthenticatorException } from '../exception/code-authenticator-exception';

const THROTTLE_SEND = ms(process.env.TWO_FACTOR_AUTH_CODE_SEND_THROTTLE || '30s');
const THROTTLE_VERIFY = ms(process.env.TWO_FACTOR_AUTH_CODE_VERIFY_THROTTLE || '30s');

@Injectable()
export class CodeAuthenticator {
    constructor(
        @Inject('CodeAuthenticators') private readonly authenticators: CodeAuthenticatorInterface[],
        @Inject('CodeStorage') private readonly codeStorage: CodeStorageInterface,
    ) {}

    public async generate(user: User2FAInterface) {
        return this.getAuthenticator(user).generate(user);
    }

    public async send(
        user: User2FAInterface,
        params: {
            smsTemplate?: string;
            emailTemplate?: string;
            throttleKey?: string;
        } = {},
    ) {
        const { throttleKey, ...options } = {
            throttleKey: '',
            ...params,
        };
        const data = await this.codeStorage.get(`${storageKeyInDb(this, user.getUuid())}-${throttleKey}-send`, true);

        if (data) {
            throw new CodeSendThrottleException(`You can send code once in ${THROTTLE_SEND / 1000} seconds`);
        }

        await this.getAuthenticator(user).send(user, options);

        await this.codeStorage.set(
            `${storageKeyInDb(this, user.getUuid())}-${throttleKey}-send`,
            JSON.stringify({ createdAt: DateTime.now().toUnixInteger() }),
            THROTTLE_SEND,
        );
    }

    public async verify(code: string, user: User2FAInterface): Promise<boolean> {
        const data = await this.codeStorage.get(`${storageKeyInDb(this, user.getUuid())}-verify`, true);

        if (data && data.count >= Number(process.env.TWO_FACTOR_AUTH_CODE_VERIFY_FAILES || 5)) {
            throw new CodeVerifyThrottleException(
                `You have entered the wrong code ${Number(
                    process.env.TWO_FACTOR_AUTH_CODE_VERIFY_FAILES || 5,
                )} times. The next attempt will be available in ${THROTTLE_VERIFY / 1000} seconds`,
            );
        }

        const res = await this.getAuthenticator(user).verify(code, user);

        if (res === false) {
            await this.codeStorage.set(
                `${storageKeyInDb(this, user.getUuid())}-verify`,
                JSON.stringify({
                    count: data ? ++data.count : 1,
                    createdAt: DateTime.now().toUnixInteger(),
                }),
                THROTTLE_VERIFY,
            );
        }
        return res;
    }

    public async reset(
        user: User2FAInterface | UserInterface,
        strategy: ('send' | 'verify')[] = ['send'],
        throttleKey = '',
    ): Promise<void> {
        if (strategy.includes('send')) {
            await this.codeStorage.del(`${storageKeyInDb(this, user.getUuid())}-${throttleKey || ''}-send`);
        }
        if (strategy.includes('verify')) {
            await this.codeStorage.del(`${storageKeyInDb(this, user.getUuid())}-verify`);
        }
    }

    private getAuthenticator(user: User2FAInterface): CodeAuthenticatorInterface {
        switch (user.getAuthenticatorType()) {
            case 'sms':
                return this.authenticators.find((authenticator) => authenticator instanceof SmsCodeAuthenticator);
            case 'email':
                return this.authenticators.find((authenticator) => authenticator instanceof EmailCodeAuthenticator);
            default:
                throw new CodeAuthenticatorException('Authenticator for this user not found');
        }
    }
}
