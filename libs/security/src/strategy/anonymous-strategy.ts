import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { JwtTokenHandler } from './jwt-token-handler';

@Injectable()
export class AnonymousStrategy extends PassportStrategy(Strategy, 'anonymous') {
    constructor(@Inject('AuthTokenHandler') private readonly tokenHandler: JwtTokenHandler) {
        super();
    }

    async validate() {
        return true;
    }
}
