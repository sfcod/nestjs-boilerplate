import { UserInterface } from './../contract/user-interface';

export class UserAuthSignInEvent {
    constructor(
        public readonly user: UserInterface,
        public readonly tokens: { token: string; refreshToken: string },
    ) {}

    public static get eventName() {
        return `security.auth.${UserAuthSignInEvent.name}`;
    }
}
