import { JwtService } from '@nestjs/jwt';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { TokenType } from '../../contract/token.type';
import { UserInterface } from '../../contract/user-interface';
import { storageKeyInDb } from '../../helper/storage.helper';
import { CodeStorageInterface } from '../../contract/code-storage.interface';

@Injectable()
export abstract class AbstractToken {
    protected constructor(
        protected readonly jwtService: JwtService,
        protected readonly codeStorage: CodeStorageInterface,
    ) {}

    public async load(user: UserInterface): Promise<TokenType | null> {
        const tokenKey = storageKeyInDb(this, user.getUuid());
        const token = await this.codeStorage.get(tokenKey);
        if (token) {
            return this.jwtService.decode(token) as TokenType;
        }

        return null;
    }

    public async save(user: UserInterface, token: string): Promise<void> {
        const tokenKey = storageKeyInDb(this, user.getUuid());
        // Clear old token if exists
        await this.clear(user);

        await this.codeStorage.set(tokenKey, token, this.tokenExpiration());
    }

    public async clear(user: UserInterface): Promise<void> {
        const tokenKey = storageKeyInDb(this, user.getUuid());

        await this.codeStorage.del(tokenKey);
    }

    public async decode(token: string): Promise<TokenType | null> {
        try {
            if (token && (await this.jwtService.verify(token))) {
                return this.jwtService.decode(token) as TokenType;
            }
        } catch (e) {
            if (e instanceof TokenExpiredError || e instanceof JsonWebTokenError) {
                return null;
            }
            throw e;
        }

        return null;
    }

    public async extract(token: string): Promise<TokenType | null> {
        const payload = await this.decode(token);
        const tokenKey = storageKeyInDb(this, payload?.symbol);
        const tokenInDb = await this.codeStorage.get(tokenKey);

        return tokenInDb === token ? payload : null;
    }

    /**
     * Milliseconds. ms('1h') / 1000
     * @protected
     */
    protected abstract tokenExpiration(): number;
}
