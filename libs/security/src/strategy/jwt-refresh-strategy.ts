import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { JwtTokenHandler } from './jwt-token-handler';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
    constructor(@Inject('RefreshTokenHandler') private readonly tokenHandler: JwtTokenHandler) {
        super();
    }

    async validate(req: Request) {
        return await this.tokenHandler.validate(req.body.refreshToken);
    }
}
