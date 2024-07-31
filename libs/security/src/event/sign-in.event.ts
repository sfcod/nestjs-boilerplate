import { UserInterface } from './../contract/user-interface';
import { Request } from 'express';

export class SignInEvent {
    constructor(
        public readonly user: UserInterface,
        public readonly req: Request,
    ) {}

    public static get eventName() {
        return `security.auth.${SignInEvent.name}`;
    }
}
