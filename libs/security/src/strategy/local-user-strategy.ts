import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { User, UserStatus } from '@libs/orm';
import { CredentialBruteForce } from '@libs/security';
import { Request } from 'express';

@Injectable()
export class LocalUserStrategy extends PassportStrategy(Strategy, 'local-user') {
    constructor(private readonly bruteForce: CredentialBruteForce) {
        super({
            usernameField: 'username',
            passwordField: 'password',
            session: false,
            passReqToCallback: true,
        });
    }

    async validate(request: Request, username: string, password: string): Promise<any> {
        const user = await this.bruteForce.process<User>(request, {
            pattern: ['user'],
            username,
            password,
        });

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
