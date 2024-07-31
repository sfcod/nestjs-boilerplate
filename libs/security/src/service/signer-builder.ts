import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { RefreshToken } from './jwt-token/refresh-token';
import { JwtService } from '@nestjs/jwt';
import { UserAuth } from './user-auth';
import { FullyKeysPair } from './keys-pair/fully-keys-pair';
import { AuthToken } from './jwt-token/auth-token';
import { ExtractJwt } from 'passport-jwt';
import { GuestKeysPair } from './keys-pair/guest-keys-pair';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable({ scope: Scope.REQUEST })
export class SignerBuilder {
    constructor(
        @Inject(REQUEST) private request,
        private readonly authToken: AuthToken,
        private readonly refreshToken: RefreshToken,
        private readonly jwtService: JwtService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    public async getSigner() {
        const keysPair = new FullyKeysPair(
            this.jwtService,
            process.env.JWT_AUTH_EXPIRES_IN,
            process.env.JWT_REFRESH_EXPIRES_IN,
        );

        return new UserAuth(this.authToken, this.refreshToken, this.eventEmitter, keysPair);
    }

    public async getGuestSigner() {
        const keysPair = new GuestKeysPair(this.jwtService, process.env.JWT_GUEST_EXPIRES_IN);

        return new UserAuth(this.authToken, this.refreshToken, this.eventEmitter, keysPair);
    }

    public async signedBy(strategy: 'guest' | 'fully'): Promise<boolean> {
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(this.request);
        const payload = await this.authToken.extract(token);

        return (
            (strategy === 'guest' && payload?.fullyAuthenticated === false) ||
            (strategy === 'fully' && payload?.fullyAuthenticated === true)
        );
    }
}
