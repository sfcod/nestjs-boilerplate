import { Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import { User, UserStatus } from '@libs/orm';

@Injectable()
export class UserProcessTemporaryPassword {
    public async process(entity: User): Promise<string | void> {
        const pwd = entity.getPlainPassword();

        if (
            (pwd || !entity.password) &&
            [UserStatus.STATUS_ACTIVE, UserStatus.STATUS_PENDING_PHONE_VERIFICATION].includes(entity.status)
        ) {
            const password = pwd || Math.random().toString(36).substr(2, 8);

            if (!pwd) {
                entity.password = await hash(password, parseInt(entity.getSalt() || '10'));
            }

            return password;
        }
    }
}
