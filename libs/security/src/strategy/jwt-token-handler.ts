import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserInterface } from '../contract/user-interface';
import { Admin, AdminStatus, User, UserStatus } from '@libs/orm';
import { JwtService } from '@nestjs/jwt';
import { TokenType } from '../contract/token.type';
import { EntityManager } from '@mikro-orm/core';
import { AbstractToken } from '../service/jwt-token/abstract-token';

@Injectable()
export class JwtTokenHandler {
    constructor(
        private readonly em: EntityManager,
        private readonly token: AbstractToken,
        protected readonly jwtService: JwtService,
    ) {}

    async decode(authToken: string): Promise<TokenType> {
        return this.jwtService.decode(authToken) as TokenType;
    }

    async validate(authToken: string) {
        const user = await this.validateUser(authToken);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }

    private async validateUser(authToken: string): Promise<UserInterface | null> {
        const payload = await this.token.extract(authToken);
        if (payload === null) {
            return null;
        }
        const { symbol: uuid, pattern } = payload;

        switch (pattern) {
            case 'admin':
                return await this.em.findOne(Admin, { id: uuid, status: AdminStatus.STATUS_ACTIVE });
            case 'user':
                const statuses = payload?.fullyAuthenticated
                    ? { status: UserStatus.STATUS_ACTIVE }
                    : {
                          status: {
                              $in: [
                                  UserStatus.STATUS_ACTIVE,
                                  UserStatus.STATUS_PENDING_EMAIL_VERIFICATION,
                                  UserStatus.STATUS_PENDING_PHONE_VERIFICATION,
                              ],
                          },
                      };
                return await this.em.findOne(User, { id: uuid, ...statuses });
        }
    }
}
