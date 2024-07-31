import { Inject, Injectable } from '@nestjs/common';
import * as ms from 'ms';
import { AbstractToken } from './abstract-token';
import { JwtService } from '@nestjs/jwt';
import { CodeStorageInterface } from '../../contract/code-storage.interface';

@Injectable()
export class RefreshToken extends AbstractToken {
    public constructor(
        protected readonly jwtService: JwtService,
        @Inject('CodeStorage') protected readonly codeStorage: CodeStorageInterface,
    ) {
        super(jwtService, codeStorage);
    }

    /**
     * Milliseconds. ms('1h')
     * @protected
     */
    protected tokenExpiration(): number {
        return ms(process.env.JWT_TOKEN_EXPIRES_IN);
    }
}
