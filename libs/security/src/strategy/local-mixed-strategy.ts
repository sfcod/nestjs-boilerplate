import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { User, Admin, UserStatus, AdminStatus } from '@libs/orm';
import { CredentialBruteForce } from '@libs/security';
import { Request } from 'express';

@Injectable()
export class LocalMixedStrategy extends PassportStrategy(Strategy, 'local-mixed') {
    constructor(private readonly bruteForce: CredentialBruteForce) {
        super({
            usernameField: 'username',
            passwordField: 'password',
            session: false,
            passReqToCallback: true,
        });
    }

    async validate(request: Request, username: string, password: string): Promise<any> {
        const user = await this.bruteForce.process<User | Admin>(request, {
            pattern: ['user', 'admin'],
            username,
            password,
        });

        if (user?.status !== UserStatus.STATUS_ACTIVE && user?.status !== AdminStatus.STATUS_ACTIVE) {
            throw new UnauthorizedException(!user ? 'Incorrect email or password' : 'User inactive');
        }

        return user;
    }
}
