import { RefreshToken } from './jwt-token/refresh-token';
import { AuthToken } from './jwt-token/auth-token';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserAuthSignInEvent } from '../event/user-auth-sign-in.event';
import { UserAuthResetEvent } from '../event/user-auth-reset.event';
import { KeysPairInterface } from '../contract/keys-pair.interface';
import { UserInterface } from '../contract/user-interface';

export class UserAuth {
    constructor(
        private readonly authToken: AuthToken,
        private readonly refreshToken: RefreshToken,
        private readonly eventEmitter: EventEmitter2,
        private readonly keysPair: KeysPairInterface,
    ) {}

    public async sign(user: UserInterface): Promise<any> {
        const { token, refreshToken } = this.keysPair.generateKeysPair(user);

        await this.authToken.save(user, token);
        if (refreshToken !== '') {
            await this.refreshToken.save(user, refreshToken);
        }

        await this.eventEmitter.emitAsync(
            UserAuthSignInEvent.eventName,
            new UserAuthSignInEvent(user, { token, refreshToken }),
        );

        return { token, refreshToken };
    }

    public async reset(user: UserInterface): Promise<any> {
        await this.authToken.clear(user);
        await this.refreshToken.clear(user);

        await this.eventEmitter.emitAsync(UserAuthResetEvent.eventName, new UserAuthResetEvent(user));
    }
}
