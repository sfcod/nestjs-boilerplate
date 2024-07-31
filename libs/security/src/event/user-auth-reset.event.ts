import { UserInterface } from './../contract/user-interface';

export class UserAuthResetEvent {
    constructor(public readonly user: UserInterface) {}

    public static get eventName() {
        return `security.auth.${UserAuthResetEvent.name}`;
    }
}
