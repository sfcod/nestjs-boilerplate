import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { User, UserStatus } from '@libs/orm';
import { CredentialBruteForce } from '../service/brute-force/credential-brute-force';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';

@Injectable()
export class LocalUserStrategy extends PassportStrategy(Strategy, 'local-user') {
    constructor(private moduleRef: ModuleRef) {
        super({
            usernameField: 'username',
            passwordField: 'password',
            session: false,
            passReqToCallback: true,
        });
    }

    async validate(request: Request, username: string, password: string): Promise<any> {
        const contextId = ContextIdFactory.getByRequest(request);
        // "UserBruteForce" is a request-scoped provider
        const bruteForce = await this.moduleRef.resolve(CredentialBruteForce, contextId, {
            strict: false,
        });

        const user = await bruteForce.process<User>(['user'], username, password);

        if (
            ![
                UserStatus.STATUS_ACTIVE,
                UserStatus.STATUS_PENDING_PHONE_VERIFICATION,
                UserStatus.STATUS_PENDING_EMAIL_VERIFICATION,
            ].includes(user?.status)
        ) {
            throw new UnauthorizedException(!user ? 'Incorrect email or password' : 'User inactive');
        }

        return user;
    }
}
