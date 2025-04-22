import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Admin, AdminStatus } from '@libs/orm';
import { CredentialBruteForce } from './../service/brute-force/credential-brute-force';
import { Request } from 'express';

@Injectable()
export class LocalAdminStrategy extends PassportStrategy(Strategy, 'local-admin') {
    constructor(private readonly bruteForce: CredentialBruteForce) {
        super({
            usernameField: 'username',
            passwordField: 'password',
            session: false,
            passReqToCallback: true,
        });
    }

    async validate(request: Request, username: string, password: string): Promise<any> {
        const user = await this.bruteForce.process<Admin>(request, {
            pattern: ['admin'],
            username,
            password,
        });

        if (user?.status !== AdminStatus.STATUS_ACTIVE) {
            throw new UnauthorizedException(!user ? 'Incorrect email or password' : 'User inactive');
        }

        return user;
    }
}
