import { JwtService } from '@nestjs/jwt';
import { UserInterface } from '../../contract/user-interface';
import { resolveStrategyType } from '../../helper/strategy.helper';
import { KeysPairInterface } from '../../contract/keys-pair.interface';

export class FullyKeysPair implements KeysPairInterface {
    constructor(
        protected readonly jwtService: JwtService,
        protected readonly expiresIn: string,
        protected readonly refreshExpiresIn: string,
    ) {}

    public generateKeysPair(user: UserInterface): { token: string; refreshToken: string } {
        const type = resolveStrategyType(user.getRoles());
        const token = this.jwtService.sign(
            {
                roles: user.getRoles(),
                symbol: user.getUuid(),
                pattern: type,
                username: user.getUsername(),
                fullyAuthenticated: true,
            },
            {
                expiresIn: this.expiresIn,
            },
        );

        const refreshToken = this.generateRefreshToken(user);

        return {
            token,
            refreshToken,
        };
    }

    protected generateRefreshToken(user: UserInterface): string {
        const type = resolveStrategyType(user.getRoles());
        return this.jwtService.sign(
            {
                symbol: user.getUuid(),
                pattern: type,
            },
            {
                expiresIn: this.refreshExpiresIn,
            },
        );
    }
}
