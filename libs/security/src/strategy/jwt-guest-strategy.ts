import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { JwtTokenHandler } from './jwt-token-handler';
import { ExtractJwt } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtGuestStrategy extends PassportStrategy(Strategy, 'jwt-guest') {
    constructor(@Inject('AuthTokenHandler') private readonly tokenHandler: JwtTokenHandler) {
        super();
    }

    async validate(req: Request) {
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        const payload = await this.tokenHandler.decode(token);

        return payload?.fullyAuthenticated ? null : await this.tokenHandler.validate(token);
    }
}
