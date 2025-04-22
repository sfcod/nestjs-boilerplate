import { Injectable } from '@nestjs/common';
import { User, UserAttribute, UserAttributeName } from '@libs/orm';
import { EntityManager } from '@mikro-orm/core';
import { CodeGenerator } from '@libs/core';
import { ResetPasswordBruteForce } from './brute-force/reset-password-brute-force';
import { DateTime } from 'luxon';
import * as ms from 'ms';
import { Request } from 'express';

@Injectable()
export class ResetPasswordService {
    private readonly CODE_TTL = ms(process.env.RECOVERY_PASSWORD_TOKEN_TTL || '7 days'); // 7 days by default

    constructor(
        private readonly em: EntityManager,
        private readonly codeGenerator: CodeGenerator,
        private readonly bruteForce: ResetPasswordBruteForce,
    ) {}

    async process(user: User) {
        user.recoveryPasswordToken = this.codeGenerator.generateHexString(6);
        const attr = await this.createExpirationAttribute(user);
        await this.em.persistAndFlush([user, attr]);

        return user.recoveryPasswordToken;
    }

    async verify(token: string, req: Request): Promise<User | false> {
        const user = await this.bruteForce.process<User>(req, { token });
        const attr = user ? await this.getExpirationAttribute(user) : null;

        if (!this.validateExpirationAttribute(attr)) {
            return false;
        }

        user.recoveryPasswordToken = null;
        this.em.remove(attr);
        await this.em.flush();

        return user;
    }

    private async createExpirationAttribute(user: User) {
        const attr: UserAttribute<string> = (await this.getExpirationAttribute(user)) || new UserAttribute(user);

        const date = DateTime.utc();
        attr.name = UserAttributeName.RECOVERY_PASSWORD_EXPIRATION;
        attr.value = date.plus(this.CODE_TTL).toFormat('yyyy-MM-dd HH:mm:ss');

        return attr;
    }

    private async getExpirationAttribute(user: User) {
        return this.em.findOne(UserAttribute, {
            user: user,
            name: UserAttributeName.RECOVERY_PASSWORD_EXPIRATION,
        });
    }

    private validateExpirationAttribute(attr: UserAttribute<string>) {
        if (!attr?.value) {
            return false;
        }

        const now = DateTime.utc();
        const expiration = DateTime.fromFormat(attr.value, 'yyyy-MM-dd HH:mm:ss', { zone: 'utc' });
        return now < expiration;
    }
}
