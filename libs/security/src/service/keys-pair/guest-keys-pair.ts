import { UserInterface } from '../../contract/user-interface';
import { resolveStrategyType } from '../../helper/strategy.helper';
import { KeysPairInterface } from '../../contract/keys-pair.interface';
import { JwtService } from '@nestjs/jwt';

export class GuestKeysPair implements KeysPairInterface {
    constructor(
        protected readonly jwtService: JwtService,
        protected readonly expiresIn: string,
    ) {}

    public generateKeysPair(user: UserInterface): { token: string; refreshToken: string } {
        const type = resolveStrategyType(user.getRoles());
        const token = this.jwtService.sign(
            {
                roles: user.getRoles(),
                symbol: user.getUuid(),
                pattern: type,
                username: user.getUsername(),
                fullyAuthenticated: false,
            },
            {
                expiresIn: this.expiresIn,
            },
        );

        return {
            token,
            refreshToken: null,
        };
    }
}
