import { CodeAuthenticatorInterface } from '../../contract/code-authenticator.interface';
import { Inject, Injectable } from '@nestjs/common';
import * as ms from 'ms';
import { User2FAInterface } from '../../contract/user-2fa.interface';
import { storageKeyInDb } from '../../helper/storage.helper';
import { CodeStorageInterface } from '../../contract/code-storage.interface';
import { CodeGenerator } from '@libs/core';

@Injectable()
export abstract class AbstractCodeAuthenticator implements CodeAuthenticatorInterface {
    protected constructor(
        @Inject('CodeStorage') protected readonly codeStorage: CodeStorageInterface,
        protected readonly codeGenerator: CodeGenerator,
    ) {}

    public async generate(user: User2FAInterface) {
        const code = this.codeGenerator.generateNumbersString();
        const storeValue = JSON.stringify({ code });

        await this.codeStorage.set(storageKeyInDb(this, user.getUuid()), storeValue, this.getTtl());

        return code;
    }

    public async verify(code: string, user: User2FAInterface) {
        const storedJson = await this.codeStorage.get(storageKeyInDb(this, user.getUuid()), true);

        if (storedJson) {
            return storedJson.code ? storedJson.code === code : false;
        }

        return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async reset(user: User2FAInterface): Promise<void> {
        // Reset code
    }

    protected getTtl(): number {
        return ms(process.env.TWO_FACTOR_AUTH_CODE_TTL || '120s');
    }

    public abstract send(user: User2FAInterface, params: Record<string, any>): Promise<void>;
}
