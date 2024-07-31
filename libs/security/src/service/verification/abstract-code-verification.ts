import { Inject, Injectable } from '@nestjs/common';
import { CodeStorageInterface } from '../../contract/code-storage.interface';
import { storageKeyInDb } from '../../helper/storage.helper';
import * as moment from 'moment';
import { CodeSendThrottleException } from '../../exception/code-send-throttle-exception';
import { CodeVerifyThrottleException } from '../../exception/code-verify-throttle-exception';
import * as ms from 'ms';

export type Composing = { to: string; code: string; template?: string };
export type ThrottleParams = { throttleKey?: string; throttleTime?: number };

@Injectable()
export abstract class AbstractCodeVerification {
    constructor(@Inject('CodeStorage') protected readonly codeStorage: CodeStorageInterface) {}

    protected async throttleSend(
        composing: Composing,
        throttleParams: ThrottleParams,
        sendFunc: () => Promise<void>,
    ): Promise<void> {
        const params = {
            throttleKey: `send`,
            throttleTime: ms(process.env.TWO_FACTOR_AUTH_CODE_SEND_THROTTLE || '30s'),
            ...throttleParams,
        };
        const data = await this.codeStorage.get(`${storageKeyInDb(this, composing.to)}-${params.throttleKey}`, true);
        if (data) {
            throw new CodeSendThrottleException(`You can send code once in ${params.throttleTime / 1000} seconds`);
        }

        await sendFunc();

        await this.codeStorage.set(
            `${storageKeyInDb(this, composing.to)}-${params.throttleKey}`,
            JSON.stringify({ createdAt: moment().unix() }),
            params.throttleTime,
        );
    }

    protected async throttleVerify(
        composing: Pick<Composing, 'code'>,
        throttleParams: ThrottleParams,
        verifyFunc: () => Promise<boolean>,
    ): Promise<boolean> {
        const params = {
            ...throttleParams,
            throttleKey: `verify`,
            throttleTime: ms(process.env.TWO_FACTOR_AUTH_CODE_VERIFY_THROTTLE || '30s'),
        };
        const data = await this.codeStorage.get(`${storageKeyInDb(this, composing.code)}-${params.throttleKey}`, true);

        if (data && data.count >= Number(process.env.TWO_FACTOR_AUTH_CODE_VERIFY_FAILES || 5)) {
            throw new CodeVerifyThrottleException(
                `You have entered the wrong code ${Number(
                    process.env.TWO_FACTOR_AUTH_CODE_VERIFY_FAILES || 5,
                )} times. The next attempt will be available in ${params.throttleTime / 1000} seconds`,
            );
        }

        const res = await verifyFunc();

        if (res === false) {
            await this.codeStorage.set(
                `${storageKeyInDb(this, composing.code)}-${params.throttleKey}`,
                JSON.stringify({
                    count: data ? ++data.count : 1,
                    createdAt: moment().unix(),
                }),
                params.throttleTime,
            );
        }
        return res;
    }

    public abstract send(composing: Composing, throttleParams?: ThrottleParams): Promise<string>;

    public abstract verify(code: string, compare: string, throttleParams?: ThrottleParams): Promise<boolean>;

    public abstract generate(): string;
}
